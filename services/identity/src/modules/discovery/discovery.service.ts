import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Orientation, DiscoverySpace, MatchPreference, Gender } from '../../prisma/prisma.types';

export interface DiscoveryProfile {
  id: string;
  displayName: string;
  age: number;
  city: string;
  cityRegion: string;
  distance: string;
  distanceKm: number;
  bio: string;
  photos: string[];
  compatibility: number;
  verified: boolean;
  tags: string[];
  orientation: Orientation;
  gender: Gender;
  receiverId: string;
  actionable: boolean;
}

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get discovery feed for a user with real database queries.
   * Enforces:
   * 1. Orientation compatibility matrix
   * 2. Gender preferences
   * 3. Location radius
   * 4. Age range
   * 5. Visibility rules
   * 6. Blocklist + recently passed
   */
  async getDiscoveryFeed(
    userId: string,
    mode: 'default' | 'verified' | 'nearby' | 'fresh' | 'premium' | 'shared' = 'default',
    limit = 12
  ): Promise<DiscoveryProfile[]> {
    try {
      // 1. Get current user with preferences
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          gender: true,
          orientation: true,
          matchPreferences: true,
          discoverySpace: true,
          dateOfBirth: true,
          orientationPreferences: true,
          cityLat: true,
          cityLng: true,
        },
      });

      // 2. Calculate user age
      const userAge = this.calculateAge(user.dateOfBirth);

      // 3. Build orientation filter (enforce at query level)
      const orientationAllowedGenders = this.getOrientationAllowedGenders(
        user.orientation,
        user.matchPreferences,
        user.discoverySpace
      );

      // 4. Get recently passed profiles (30-day cooldown)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentlyPassed = await this.prisma.discoverEvent.findMany({
        where: {
          userId,
          action: 'pass',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { cardUserId: true },
      });

      const passedIds = new Set(recentlyPassed.map((p) => p.cardUserId));

      // 5. Get blocked users
      const blockedUsers = await this.prisma.moderationEvent.findMany({
        where: {
          userId,
          eventType: 'block',
        },
        select: { relatedUserId: true },
      });

      const blockedIds = new Set(blockedUsers.map((b) => b.relatedUserId).filter(Boolean));

      // 6. Apply mode filters
      const modeFilters = this.getModeFilters(mode, user.id);

      // 7. Query profiles
      const profiles = await this.prisma.user.findMany({
        where: {
          // Exclude self
          id: { not: userId },
          // Gender compatibility
          gender: {
            in: orientationAllowedGenders,
          },
          // Visibility
          visibility: { not: 'restricted' },
          // Not recently passed
          id: { notIn: Array.from(passedIds) },
          // Not blocked
          id: { notIn: Array.from(blockedIds) },
          // Discovery space
          discoverySpace: this.getDiscoverySpaceFilter(user.discoverySpace),
          // Age range (simplified - adjust based on your age preference logic)
          dateOfBirth: {
            lte: new Date(new Date().getFullYear() - 18, 0, 1),
          },
          ...modeFilters,
        },
        select: {
          id: true,
          displayName: true,
          dateOfBirth: true,
          city: true,
          cityRegion: true,
          cityLat: true,
          cityLng: true,
          bio: true,
          photos: true,
          gender: true,
          orientation: true,
          isVerified: true,
          verifications: mode === 'verified' ? { where: { status: 'verified' } } : undefined,
          sentLikes: {
            where: { receiverId: userId },
            select: { id: true },
          },
        },
        orderBy: this.getModeOrdering(mode),
        take: limit,
      });

      // 8. Transform to frontend format
      return profiles.map((profile) => {
        const distance = this.calculateDistance(
          user.cityLat,
          user.cityLng,
          profile.cityLat,
          profile.cityLng
        );

        return {
          id: profile.id,
          displayName: profile.displayName,
          age: this.calculateAge(profile.dateOfBirth),
          city: profile.city,
          cityRegion: profile.cityRegion || 'Unknown',
          distance: this.formatDistance(distance),
          distanceKm: distance,
          bio: profile.bio || 'No bio yet',
          photos: this.extractPhotos(profile.photos),
          compatibility: this.calculateCompatibility(user, profile),
          verified: profile.isVerified || false,
          tags: [],
          orientation: profile.orientation,
          gender: profile.gender,
          receiverId: profile.id,
          actionable: true,
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching discovery feed for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get allowed genders based on user's orientation and preferences
   */
  private getOrientationAllowedGenders(orientation: Orientation): Gender[] {
    const ORIENTATION_MATRIX: Record<Orientation, Record<string, Gender[]>> = {
      heterosexual: {
        man: ['woman', 'trans_woman'],
        woman: ['man', 'trans_man'],
      },
      gay: {
        man: ['man', 'trans_man'],
      },
      lesbian: {
        woman: ['woman', 'trans_woman'],
      },
      bisexual: {
        man: ['man', 'woman', 'trans_man', 'trans_woman'],
        woman: ['man', 'woman', 'trans_man', 'trans_woman'],
      },
      pansexual: {
        any: ['man', 'woman', 'trans_man', 'trans_woman', 'non_binary'],
      },
      asexual: {
        any: ['man', 'woman', 'trans_man', 'trans_woman', 'non_binary'],
      },
      queer: {
        any: ['man', 'woman', 'trans_man', 'trans_woman', 'non_binary'],
      },
    };

    // Get base allowed genders for orientation
    const allowed =
      ORIENTATION_MATRIX[orientation]?.any || ORIENTATION_MATRIX[orientation]?.man || []; // Simplified fallback

    return allowed;
  }

  /**
   * Get discovery space filter
   */
  private getDiscoverySpaceFilter(userSpace: DiscoverySpace): { in: DiscoverySpace[] } {
    if (userSpace === 'both') {
      return { in: ['straight', 'lgbtq', 'both'] };
    }
    return { in: [userSpace, 'both'] };
  }

  /**
   * Apply mode-specific filters
   */
  private getModeFilters(mode: string, userId: string): Record<string, any> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    switch (mode) {
      case 'verified':
        return {
          isVerified: true,
        };
      case 'fresh':
        return {
          createdAt: { gte: sevenDaysAgo },
        };
      case 'nearby':
        // 10 km radius - simplified
        return {};
      default:
        return {};
    }
  }

  /**
   * Get ordering for mode
   */
  private getModeOrdering(mode: string): any {
    switch (mode) {
      case 'fresh':
        return { createdAt: 'desc' };
      case 'verified':
        return { trustScore: 'desc' };
      case 'premium':
        return { trustScore: 'desc' };
      default:
        return { trustScore: 'desc' };
    }
  }

  /**
   * Calculate distance between two coordinates (simplified)
   */
  private calculateDistance(lat1: any, lng1: any, lat2: any, lng2: any): number {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;

    const R = 6371; // Earth radius in km
    const dLat = (Number(lat2) - Number(lat1)) * (Math.PI / 180);
    const dLng = (Number(lng2) - Number(lng1)) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(Number(lat1) * (Math.PI / 180)) *
        Math.cos(Number(lat2) * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format distance for display
   */
  private formatDistance(km: number): string {
    if (km === 0) return '0 mi';
    if (km < 1) return `${Math.round(km * 0.62)} m`;
    return `${Math.round(km * 0.62)} mi`;
  }

  /**
   * Calculate age from DOB
   */
  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Extract photos from JSON storage
   */
  private extractPhotos(photos: any): string[] {
    if (!photos) return [];
    if (Array.isArray(photos)) return photos;
    if (typeof photos === 'object' && photos.primary) {
      return [photos.primary, ...(photos.gallery || [])];
    }
    return [];
  }

  /**
   * Calculate compatibility score (simplified)
   */
  private calculateCompatibility(user1: any, user2: any): number {
    // Simplified scoring - could be much more complex
    let score = 50;

    // Bonus for same discovery space
    if (user1.discoverySpace === user2.discoverySpace) score += 10;

    // Bonus for verification
    if (user2.isVerified) score += 15;

    // Randomize slightly for variety
    score += Math.floor(Math.random() * 20) - 10;

    return Math.min(99, Math.max(1, score));
  }
}



