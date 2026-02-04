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
   * Get all active matches for a user
   */
  async getActiveMatches(userId: string, limit = 50): Promise<MatchWithUser[]> {
    try {
      const matches = await this.prisma.match.findMany({
        where: {
          OR: [
            { userId1: userId, status: 'active' },
            { userId2: userId, status: 'active' },
          ],
        },
        orderBy: { lastInteractionAt: 'desc' },
        take: limit,
      });

      return this.enrichMatchesWithUsers(userId, matches);
    } catch (error) {
      console.error('[MatchesService] Error getting active matches:', error);
      return [];
    }
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
      return [];
    }
  }

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
