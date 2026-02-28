import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getMatches, getProfile } from '@/lib/dev-data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSession();

  // Allow explicit userId query for preview/testing
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? session?.userId ?? null;
  const radiusKm = Number(searchParams.get('radiusKm') ?? '100');
  const limit = Number(searchParams.get('limit') ?? '12');
  const verifiedOnly = searchParams.get('verifiedOnly') === '1' || searchParams.get('verifiedOnly') === 'true';
  const interestsParam = searchParams.get('interests');
  const interestFilters = interestsParam
    ? interestsParam
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const requester = getProfile(userId);

  if (!requester?.orientation) {
    return NextResponse.json({ error: 'missing_orientation' }, { status: 400 });
  }

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const requesterTags: string[] = requester.tags ?? [];
  const requesterLat = requester.lat;
  const requesterLng = requester.lng;

  const pool = getMatches(userId)
    // hard filter: same orientation only
    .filter((m) => m.orientation && m.orientation === requester.orientation)
    .filter((m) => (verifiedOnly ? true /* all seeded profiles treated as verified */ : true))
    .filter((m) => {
      if (!interestFilters.length) return true;
      const tags = m.tags ?? [];
      const set = new Set(tags.map((t) => t.toLowerCase()));
      return interestFilters.some((i) => set.has(i));
    })
    .map((m) => {
      const dist = requesterLat != null && requesterLng != null && m.lat != null && m.lng != null
        ? haversineKm(requesterLat, requesterLng, m.lat, m.lng)
        : Number.POSITIVE_INFINITY;

      const overlap = (() => {
        const tags = m.tags ?? [];
        if (!tags.length || !requesterTags.length) return 0;
        const set = new Set(tags.map((t) => t.toLowerCase()));
        const common = requesterTags.filter((t) => set.has(t.toLowerCase())).length;
        return common / Math.max(requesterTags.length, 1);
      })();

      const distanceScore = Number.isFinite(dist) ? Math.max(0, 1 - dist / Math.max(radiusKm, 1)) : 0;
      const interestScore = Math.min(1, overlap);
      const verificationBonus = 0.1; // assume verified in dev seed

      const score = 0.6 * distanceScore + 0.3 * interestScore + verificationBonus;

      return { match: m, dist, score };
    })
    // optional hard cutoff on distance
    .filter((entry) => entry.dist === Number.POSITIVE_INFINITY ? true : entry.dist <= radiusKm * 1.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number.isFinite(limit) ? limit : 12)
    .map(({ match, score }) => ({
      id: match.id,
      displayName: match.name,
      city: match.city,
      bio: match.tagline,
      role: match.role,
      tags: match.tags ?? [],
      compatibilityScore: Math.round(Math.min(100, Math.max(0, score * 100))),
      orientation: match.orientation,
      isVerified: true,
      photos: match.photos?.length ? match.photos : [match.avatar],
    }));

  return NextResponse.json(pool);
}
