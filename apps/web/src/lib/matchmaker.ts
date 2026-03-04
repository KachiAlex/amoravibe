import type { User } from '@prisma/client';
import prisma from '@/lib/db';

type NormalizedUser = {
  id: string;
  gender: string | null;
  orientationGroup: 'straight' | 'lgbtq' | 'unknown';
  interests: string[];
  lookingFor: string | null;
  locationCity: string | null;
  locationCountry: string | null;
};

const INTENT_SERIOUSNESS: Record<string, number> = {
  casual: 1,
  'casual dating': 1,
  friendship: 1,
  friends: 1,
  'short-term relationship': 2,
  relationship: 2,
  serious: 2,
  'long-term relationship': 3,
  longterm: 3,
  marriage: 3,
};

const STRAIGHT_KEYWORDS = new Set(['straight', 'heterosexual']);
const LGBTQ_KEYWORDS = new Set(['lgbtq', 'gay', 'lesbian', 'bisexual', 'pansexual', 'queer']);

const FEMALE_KEYWORDS = new Set(['female', 'woman']);
const MALE_KEYWORDS = new Set(['male', 'man']);

function normalizeString(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function normalizeGender(value?: string | null): 'female' | 'male' | null {
  const normalized = normalizeString(value);
  if (FEMALE_KEYWORDS.has(normalized)) return 'female';
  if (MALE_KEYWORDS.has(normalized)) return 'male';
  return null;
}

function classifyOrientation(value?: string | null): 'straight' | 'lgbtq' | 'unknown' {
  const normalized = normalizeString(value);
  if (!normalized) return 'unknown';
  if (STRAIGHT_KEYWORDS.has(normalized)) return 'straight';
  if (LGBTQ_KEYWORDS.has(normalized)) return 'lgbtq';
  return 'unknown';
}

function normalizeInterests(list?: string[] | null) {
  if (!Array.isArray(list)) return [];
  return list
    .map((interest) => normalizeString(interest))
    .filter((interest) => interest.length > 0);
}

function parseLocation(location?: string | null) {
  if (!location) return { city: null, country: null };
  const parts = location
    .split(',')
    .map((part) => normalizeString(part))
    .filter(Boolean);
  if (parts.length === 0) return { city: null, country: null };
  const city = parts[0] ?? null;
  const country = parts[parts.length - 1] ?? null;
  return { city, country };
}

function normalizeUser(user: User): NormalizedUser {
  const { city, country } = parseLocation(user.location);
  const rawLookingFor = (user as unknown as { lookingFor?: string | null })?.lookingFor ?? null;
  return {
    id: user.id,
    gender: normalizeGender(user.gender),
    orientationGroup: classifyOrientation(user.orientation),
    interests: normalizeInterests(user.interests),
    lookingFor: normalizeString(rawLookingFor),
    locationCity: city,
    locationCountry: country,
  };
}

function interestOverlap(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  const set = new Set(a);
  let overlap = 0;
  for (const interest of b) {
    if (set.has(interest)) overlap += 1;
  }
  return overlap;
}

function seriousnessScore(intent: string | null) {
  if (!intent) return 0;
  return INTENT_SERIOUSNESS[intent] ?? 0;
}

function gendersCompatible(user: NormalizedUser, candidate: NormalizedUser) {
  if (user.orientationGroup !== 'straight') {
    // Queer users can match with any non-straight candidates
    return candidate.orientationGroup !== 'straight';
  }

  if (!user.gender || !candidate.gender) return false;

  const userPrefers = user.gender === 'male' ? 'female' : 'male';
  return candidate.gender === userPrefers && candidate.orientationGroup === 'straight';
}

function computeCompatibility(user: NormalizedUser, candidate: NormalizedUser) {
  const overlap = interestOverlap(user.interests, candidate.interests);
  const userIntent = seriousnessScore(user.lookingFor);
  const candidateIntent = seriousnessScore(candidate.lookingFor);
  const intentDiff = Math.abs(userIntent - candidateIntent);

  const sameCity = Boolean(user.locationCity && user.locationCity === candidate.locationCity);
  const sameCountry = Boolean(user.locationCountry && user.locationCountry === candidate.locationCountry);

  let score = 60;

  if (overlap > 0) {
    score += Math.min(20, overlap * 5);
  }

  if (sameCity) {
    score += 15;
  } else if (sameCountry) {
    score += 8;
  }

  if (userIntent && candidateIntent) {
    score += Math.max(0, 12 - intentDiff * 6);
  }

  return {
    score: Math.min(99, score),
    overlap,
  };
}

export async function generateMatchesForUser(userId: string) {
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userRecord || !userRecord.onboardingCompleted) {
    return;
  }

  const user = normalizeUser(userRecord);

  const candidates = await prisma.user.findMany({
    where: {
      onboardingCompleted: true,
      id: { not: userId },
    },
  });

  for (const candidateRecord of candidates) {
    const candidate = normalizeUser(candidateRecord);

    if (!gendersCompatible(user, candidate)) {
      continue;
    }

    const { score, overlap } = computeCompatibility(user, candidate);
    if (score < 55) {
      continue;
    }

    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { requesterId: userId, targetUserId: candidate.id },
          { requesterId: candidate.id, targetUserId: userId },
        ],
      },
    });

    if (existing) {
      await prisma.match.update({
        where: { id: existing.id },
        data: {
          compatibilityScore: score,
          tagsOverlap: overlap,
          status: 'CONNECTED',
        },
      });
      continue;
    }

    await prisma.match.create({
      data: {
        requesterId: userId,
        targetUserId: candidate.id,
        status: 'CONNECTED',
        compatibilityScore: score,
        tagsOverlap: overlap,
      },
    });
  }
}
