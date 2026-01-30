import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchCandidateDto } from './dto/match.dto';
import { Prisma, User, $Enums } from '../../prisma/client';
import { Gender } from '../../common/enums/gender.enum';
import { MatchPreference } from '../../common/enums/match-preference.enum';
import { VisibilityStatus } from '../../common/enums/visibility-status.enum';
import { DiscoverySpace } from '../../common/enums/discovery-space.enum';
import { Orientation } from '../../common/enums/orientation.enum';

const DEFAULT_MATCH_LIMIT = 12;
const MAX_MATCH_LIMIT = 50;
const MAX_DISTANCE_KM = 50;

type Coordinates = {
  lat: number;
  lng: number;
};

type NormalizedUser = Omit<
  User,
  | 'gender'
  | 'discoverySpace'
  | 'matchPreferences'
  | 'orientation'
  | 'orientationPreferences'
  | 'cityLat'
  | 'cityLng'
> & {
  gender: Gender;
  discoverySpace: DiscoverySpace;
  matchPreferences: MatchPreference[];
  orientation: Orientation;
  orientationPreferences: Orientation[];
  cityLat: number | null;
  cityLng: number | null;
};

type CandidateRecord = {
  id: string;
  displayName: string;
  city: string;
  cityCountry: string | null;
  cityRegion: string | null;
  cityLat: Prisma.Decimal | null;
  cityLng: Prisma.Decimal | null;
  bio: string | null;
  photos: Prisma.JsonValue;
  trustScore: number;
  orientation: $Enums.Orientation;
  matchPreferences: $Enums.MatchPreference[];
  discoverySpace: $Enums.DiscoverySpace;
  isVerified: boolean;
  gender: $Enums.Gender;
  orientationPreferences: $Enums.Orientation[];
};

type NormalizedCandidate = Omit<
  CandidateRecord,
  | 'gender'
  | 'discoverySpace'
  | 'matchPreferences'
  | 'orientation'
  | 'orientationPreferences'
  | 'cityLat'
  | 'cityLng'
  | 'cityCountry'
  | 'cityRegion'
  | 'photos'
> & {
  gender: Gender;
  discoverySpace: DiscoverySpace;
  matchPreferences: MatchPreference[];
  orientation: Orientation;
  orientationPreferences: Orientation[];
  cityLat: number | null;
  cityLng: number | null;
  cityCountry: string | null;
  cityRegion: string | null;
  photos: Prisma.JsonValue;
};

type ComparableProfile = Pick<
  NormalizedUser,
  | 'orientation'
  | 'orientationPreferences'
  | 'matchPreferences'
  | 'gender'
  | 'discoverySpace'
  | 'trustScore'
>;

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async findMatches(userId: string, limit = DEFAULT_MATCH_LIMIT): Promise<MatchCandidateDto[]> {
    const userRecord = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userRecord) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const user = this.normalizeUserEnums(userRecord);

    const normalizedLimit = Math.min(Math.max(limit, 1), MAX_MATCH_LIMIT);
    const genderPreferences = this.mapMatchPreferencesToGenders(user.matchPreferences);
    const discoverySpaces = this.allowedDiscoverySpaces(user.discoverySpace);
    const userLocation = this.resolveCoordinates(user.cityLat, user.cityLng);

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
        cityCountry: true,
        cityRegion: true,
        cityLat: true,
        cityLng: true,
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
      .map((candidate) => this.normalizeCandidateEnums(candidate as CandidateRecord))
      .map((candidate) => {
        const compatibility = this.computeCompatibility(user, candidate);
        const candidateLocation = this.resolveCoordinates(candidate.cityLat, candidate.cityLng);
        const distanceKm =
          userLocation && candidateLocation
            ? this.roundDistance(this.computeDistanceKm(userLocation, candidateLocation))
            : null;

        return {
          candidate,
          compatibility,
          distanceKm,
        };
      })
      .filter((entry) => {
        if (!userLocation) {
          return true;
        }
        if (entry.distanceKm === null) {
          return true;
        }
        return entry.distanceKm <= MAX_DISTANCE_KM;
      })
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, normalizedLimit)
      .map(({ candidate, compatibility, distanceKm }) => ({
        id: candidate.id,
        displayName: candidate.displayName,
        city: candidate.city,
        cityCountry: candidate.cityCountry,
        cityRegion: candidate.cityRegion,
        bio: candidate.bio ?? null,
        photos: this.extractPhotos(candidate.photos),
        trustScore: candidate.trustScore,
        orientation: candidate.orientation,
        matchPreferences: candidate.matchPreferences,
        discoverySpace: candidate.discoverySpace,
        isVerified: candidate.isVerified,
        compatibilityScore: compatibility,
        distanceKm,
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

  private computeCompatibility(user: ComparableProfile, candidate: ComparableProfile): number {
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

  private normalizeUserEnums(user: User): NormalizedUser {
    return {
      ...user,
      gender: user.gender as Gender,
      discoverySpace: user.discoverySpace as DiscoverySpace,
      matchPreferences: (user.matchPreferences ?? []) as MatchPreference[],
      orientation: user.orientation as Orientation,
      orientationPreferences: (user.orientationPreferences ?? []) as Orientation[],
      cityLat: this.toNumber(user.cityLat),
      cityLng: this.toNumber(user.cityLng),
    };
  }

  private normalizeCandidateEnums(candidate: CandidateRecord): NormalizedCandidate {
    return {
      ...candidate,
      gender: candidate.gender as Gender,
      discoverySpace: candidate.discoverySpace as DiscoverySpace,
      matchPreferences: (candidate.matchPreferences ?? []) as MatchPreference[],
      orientation: candidate.orientation as Orientation,
      orientationPreferences: (candidate.orientationPreferences ?? []) as Orientation[],
      cityLat: this.toNumber(candidate.cityLat),
      cityLng: this.toNumber(candidate.cityLng),
      cityCountry: candidate.cityCountry ?? null,
      cityRegion: candidate.cityRegion ?? null,
    };
  }

  private resolveCoordinates(lat: number | null, lng: number | null): Coordinates | null {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return null;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    return { lat, lng };
  }

  private computeDistanceKm(a: Coordinates, b: Coordinates): number {
    const earthRadiusKm = 6371;
    const dLat = this.deg2rad(b.lat - a.lat);
    const dLng = this.deg2rad(b.lng - a.lng);
    const lat1 = this.deg2rad(a.lat);
    const lat2 = this.deg2rad(b.lat);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const haversine = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(Math.max(0, 1 - haversine)));
    return earthRadiusKm * c;
  }

  private deg2rad(value: number): number {
    return (value * Math.PI) / 180;
  }

  private roundDistance(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'number') {
      return value;
    }
    return value.toNumber();
  }
}
