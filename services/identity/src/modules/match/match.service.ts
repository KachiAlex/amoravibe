import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchCandidateDto } from './dto/match.dto';
import { Prisma, User } from '../../../prisma/client';
import { Gender } from '../../common/enums/gender.enum';
import { MatchPreference } from '../../common/enums/match-preference.enum';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';
import { DiscoverySpace } from '../../common/enums/discovery-space.enum';

const DEFAULT_MATCH_LIMIT = 12;
const MAX_MATCH_LIMIT = 50;

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async findMatches(userId: string, limit = DEFAULT_MATCH_LIMIT): Promise<MatchCandidateDto[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const normalizedLimit = Math.min(Math.max(limit, 1), MAX_MATCH_LIMIT);
    const genderPreferences = this.mapMatchPreferencesToGenders(user.matchPreferences);
    const discoverySpaces = this.allowedDiscoverySpaces(user.discoverySpace);

    const candidateWhere: Prisma.UserWhereInput = {
      id: { not: user.id },
      visibility: { not: VisibilityStatus.RESTRICTED },
      orientation: { in: user.orientationPreferences },
      trustScore: { gte: Math.max(user.trustScore - 25, 10) },
      discoverySpace: { in: discoverySpaces },
    };

    if (genderPreferences?.length && !genderPreferences.includes('any')) {
      candidateWhere.gender = { in: genderPreferences as Gender[] };
    }

    const compatibilityFilters = this.buildCompatibilityFilters(user.gender);

    const candidates = await this.prisma.user.findMany({
      where: {
        ...candidateWhere,
        ...compatibilityFilters,
      },
      select: {
        id: true,
        displayName: true,
        city: true,
        bio: true,
        photos: true,
        trustScore: true,
        orientation: true,
        matchPreferences: true,
        discoverySpace: true,
        isVerified: true,
        gender: true,
        orientationPreferences: true,
      },
      take: normalizedLimit * 3,
      orderBy: [{ trustScore: 'desc' }, { createdAt: 'desc' }],
    });

    const enriched = candidates
      .map((candidate) => ({
        candidate,
        compatibility: this.computeCompatibility(user, candidate as User),
      }))
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, normalizedLimit)
      .map(({ candidate, compatibility }) => ({
        id: candidate.id,
        displayName: candidate.displayName,
        city: candidate.city,
        bio: candidate.bio ?? null,
        photos: this.extractPhotos(candidate.photos),
        trustScore: candidate.trustScore,
        orientation: candidate.orientation,
        matchPreferences: candidate.matchPreferences as MatchPreference[],
        discoverySpace: candidate.discoverySpace,
        isVerified: candidate.isVerified,
        compatibilityScore: compatibility,
      }));

    return enriched;
  }

  private extractPhotos(photos: Prisma.JsonValue | null): string[] {
    if (!Array.isArray(photos)) {
      return [];
    }

    return photos.filter((photo): photo is string => typeof photo === 'string');
  }

  private mapMatchPreferencesToGenders(preferences: MatchPreference[]): (Gender | 'any')[] | null {
    if (!preferences?.length) {
      return null;
    }

    if (preferences.includes(MatchPreference.EVERYONE)) {
      return ['any'];
    }

    const genders = new Set<Gender>();
    for (const preference of preferences) {
      if (preference === MatchPreference.MEN) {
        genders.add(Gender.MAN);
        genders.add(Gender.TRANS_MAN);
      }
      if (preference === MatchPreference.WOMEN) {
        genders.add(Gender.WOMAN);
        genders.add(Gender.TRANS_WOMAN);
      }
    }

    return Array.from(genders);
  }

  private buildCompatibilityFilters(userGender: Gender): Prisma.UserWhereInput {
    const targetPreference = this.genderToMatchPreference(userGender);
    if (!targetPreference) {
      return {};
    }

    return {
      OR: [
        { matchPreferences: { has: MatchPreference.EVERYONE } },
        { matchPreferences: { has: targetPreference } },
      ],
    };
  }

  private genderToMatchPreference(gender: Gender): MatchPreference | null {
    switch (gender) {
      case Gender.MAN:
      case Gender.TRANS_MAN:
        return MatchPreference.MEN;
      case Gender.WOMAN:
      case Gender.TRANS_WOMAN:
        return MatchPreference.WOMEN;
      default:
        return null;
    }
  }

  private allowedDiscoverySpaces(space: DiscoverySpace): DiscoverySpace[] {
    switch (space) {
      case DiscoverySpace.BOTH:
        return [DiscoverySpace.BOTH, DiscoverySpace.STRAIGHT, DiscoverySpace.LGBTQ];
      case DiscoverySpace.LGBTQ:
        return [DiscoverySpace.LGBTQ, DiscoverySpace.BOTH];
      case DiscoverySpace.STRAIGHT:
      default:
        return [DiscoverySpace.STRAIGHT, DiscoverySpace.BOTH];
    }
  }

  private computeCompatibility(user: User, candidate: User): number {
    let score = 40;

    if (candidate.orientationPreferences?.includes(user.orientation)) {
      score += 15;
    }

    if (user.orientationPreferences?.includes(candidate.orientation)) {
      score += 15;
    }

    const userTargetPref = this.genderToMatchPreference(candidate.gender);
    if (
      userTargetPref &&
      (user.matchPreferences?.includes(userTargetPref) ||
        user.matchPreferences?.includes(MatchPreference.EVERYONE))
    ) {
      score += 15;
    }

    const candidateTargetPref = this.genderToMatchPreference(user.gender);
    if (
      candidateTargetPref &&
      (candidate.matchPreferences?.includes(candidateTargetPref) ||
        candidate.matchPreferences?.includes(MatchPreference.EVERYONE))
    ) {
      score += 15;
    }

    const trustDelta = Math.abs((candidate.trustScore ?? 50) - (user.trustScore ?? 50));
    score += Math.max(0, 15 - Math.round(trustDelta / 5));

    if (
      candidate.discoverySpace === user.discoverySpace ||
      candidate.discoverySpace === DiscoverySpace.BOTH
    ) {
      score += 10;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }
}
