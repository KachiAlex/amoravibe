import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface MatchRecord {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: Date;
  status: 'active' | 'archived' | 'expired';
  lastInteractionAt?: Date;
  expiresAt?: Date;
}

export interface MatchWithUser extends MatchRecord {
  otherUser: {
    id: string;
    displayName: string;
    city?: string;
    photos?: any;
    trustScore?: number;
    orientation?: string;
    isVerified?: boolean;
  };
}

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get mock matches data for local testing when database is unavailable
   */
  private getMockMatches(): MatchWithUser[] {
    const now = new Date();
    return [
      {
        id: 'mock-match-1',
        userId1: 'user-1',
        userId2: 'user-test-1',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'active',
        lastInteractionAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        expiresAt: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        otherUser: {\n          id: 'user-test-1',\n          displayName: 'Alex Johnson',\n          city: 'San Francisco, CA',\n          trustScore: 85,\n          isVerified: true,\n          orientation: 'bisexual',\n          photos: { main: 'https://via.placeholder.com/400?text=Alex' },\n        },\n      },\n      {\n        id: 'mock-match-2',\n        userId1: 'user-1',\n        userId2: 'user-test-2',\n        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago\n        status: 'active',\n        lastInteractionAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago\n        expiresAt: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now\n        otherUser: {\n          id: 'user-test-2',\n          displayName: 'Jordan Lee',\n          city: 'Oakland, CA',\n          trustScore: 72,\n          isVerified: false,\n          orientation: 'gay',\n          photos: { main: 'https://via.placeholder.com/400?text=Jordan' },\n        },\n      },\n      {\n        id: 'mock-match-3',\n        userId1: 'user-1',\n        userId2: 'user-test-3',\n        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago\n        status: 'active',\n        lastInteractionAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago\n        expiresAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now\n        otherUser: {\n          id: 'user-test-3',\n          displayName: 'Casey Martinez',\n          city: 'Berkeley, CA',\n          trustScore: 78,\n          isVerified: true,\n          orientation: 'lesbian',\n          photos: { main: 'https://via.placeholder.com/400?text=Casey' },\n        },\n      },\n    ];\n  }\n\n  /**\n   * Get all active matches for a user\n   */\n  async getActiveMatches(userId: string, limit = 50): Promise<MatchWithUser[]> {\n    try {\n      const matches = await this.prisma.match.findMany({\n        where: {\n          OR: [\n            { userId1: userId, status: 'active' },\n            { userId2: userId, status: 'active' },\n          ],\n        },\n        orderBy: { lastInteractionAt: 'desc' },\n        take: limit,\n      });\n\n      return this.enrichMatchesWithUsers(userId, matches);\n    } catch (error) {\n      console.error('[MatchesService] Error getting active matches:', error);\n      console.log('[MatchesService] Returning mock matches for development');\n      return this.getMockMatches().filter(m => m.status === 'active').slice(0, limit);
  }

  /**
   * Get all archived matches for a user
   */
  async getArchivedMatches(userId: string, limit = 50): Promise<MatchWithUser[]> {
    try {
      const matches = await this.prisma.match.findMany({
        where: {
          OR: [
            { userId1: userId, status: 'archived' },
            { userId2: userId, status: 'archived' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return this.enrichMatchesWithUsers(userId, matches);
    } catch (error) {
      console.error('[MatchesService] Error getting archived matches:', error);
      console.log('[MatchesService] Returning empty array (no archived matches in mock data)');\n      return [];\n    }\n  }

  /**
   * Unmatch (soft delete) - archives the match and notifies other user
   */
  async unmatch(userId: string, matchId: string): Promise<boolean> {
    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        return false;
      }

      // Verify user is part of this match
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return false;
      }

      // Archive the match
      await this.prisma.match.update({
        where: { id: matchId },
        data: { status: 'archived' },
      });

      // TODO: Send notification to other user
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      console.log(`[MatchesService] User ${userId} unmatched with ${otherUserId}`);

      return true;
    } catch (error) {
      console.error('[MatchesService] Error unmatching:', error);
      return false;
    }
  }

  /**
   * Block user - hard deletes match and adds to blacklist
   */
  async blockUser(userId: string, blockedUserId: string, matchId: string): Promise<boolean> {
    try {
      const match = await this.prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        return false;
      }

      // Verify user is part of this match
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return false;
      }

      // Delete the match (hard delete)
      await this.prisma.match.delete({
        where: { id: matchId },
      });

      // Add to blacklist (if blacklist table exists)
      // TODO: Implement blacklist logic
      console.log(`[MatchesService] User ${userId} blocked ${blockedUserId}`);

      return true;
    } catch (error) {
      console.error('[MatchesService] Error blocking user:', error);
      return false;
    }
  }

  /**
   * Check if two users have a mutual match
   */
  async checkMatch(userId1: string, userId2: string): Promise<MatchRecord | null> {
    try {
      const match = await this.prisma.match.findFirst({
        where: {
          OR: [
            { userId1, userId2, status: 'active' },
            { userId1: userId2, userId2: userId1, status: 'active' },
          ],
        },
      });

      return match || null;
    } catch (error) {
      console.error('[MatchesService] Error checking match:', error);
      return null;
    }
  }

  /**
   * Update last interaction timestamp
   */
  async updateLastInteraction(matchId: string): Promise<boolean> {
    try {
      await this.prisma.match.update({
        where: { id: matchId },
        data: { lastInteractionAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error('[MatchesService] Error updating last interaction:', error);
      return false;
    }
  }

  /**
   * Enrich matches with user data
   */
  private async enrichMatchesWithUsers(
    userId: string,
    matches: any[]
  ): Promise<MatchWithUser[]> {
    const enriched = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
        try {
          const otherUser = await this.prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
              id: true,
              displayName: true,
              city: true,
              photos: true,
              trustScore: true,
              orientation: true,
              isVerified: true,
            },
          });

          return {
            ...match,
            otherUser: otherUser || { id: otherUserId, displayName: 'User' },
          };
        } catch (error) {
          console.error(`[MatchesService] Error enriching match ${match.id}:`, error);
          return {
            ...match,
            otherUser: { id: otherUserId, displayName: 'User' },
          };
        }
      })
    );

    return enriched;
  }
}
