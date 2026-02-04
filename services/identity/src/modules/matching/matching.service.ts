import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface Match {
  id: string;
  matchUserId: string;
  displayName: string;
  avatar: string;
  city: string;
  lastInteractionAt: Date | null;
  unreadCount: number;
  status: 'new' | 'active' | 'expiring';
  compatibilityScore: number;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get matches for a user from the database
   * Only returns mutual likes that have been converted to matches
   */
  async getMatches(
    userId: string,
    status: 'active' | 'archived' = 'active',
    limit = 12
  ): Promise<Match[]> {
    try {
      // Query: Get all likes where this user is sender AND receiver also liked them back
      const mutualLikes = await this.prisma.userLike.findMany({
        where: {
          senderId: userId,
          status: 'matched', // Only matched likes
        },
        include: {
          receiver: {
            select: {
              id: true,
              displayName: true,
              photos: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Transform to frontend format
      return mutualLikes.map((like, index) => ({
        id: like.id,
        matchUserId: like.receiver.id,
        displayName: like.receiver.displayName,
        avatar: this.extractPrimaryPhoto(like.receiver.photos),
        city: like.receiver.city || 'Unknown location',
        lastInteractionAt: like.createdAt,
        unreadCount: 0,
        status: index === 0 ? 'new' : index === 1 ? 'active' : 'expiring',
        compatibilityScore: 85 + Math.floor(Math.random() * 15), // Simplified
      }));
    } catch (error) {
      this.logger.error(`Error fetching matches for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Create a like and auto-match if mutual
   */
  async createLike(
    senderId: string,
    receiverId: string,
    highlight?: string
  ): Promise<{ matched: boolean; likeId: string }> {
    try {
      // Check if already liked
      const existingLike = await this.prisma.userLike.findFirst({
        where: {
          senderId,
          receiverId,
        },
      });

      if (existingLike) {
        return { matched: existingLike.status === 'matched', likeId: existingLike.id };
      }

      // Check if receiver already likes sender (mutual match)
      const reciprocalLike = await this.prisma.userLike.findFirst({
        where: {
          senderId: receiverId,
          receiverId: senderId,
        },
      });

      // Create the like
      const like = await this.prisma.userLike.create({
        data: {
          senderId,
          receiverId,
          highlight,
          status: reciprocalLike ? 'matched' : 'pending',
        },
      });

      // If mutual, also update the reciprocal like to matched
      if (reciprocalLike && reciprocalLike.status !== 'matched') {
        await this.prisma.userLike.update({
          where: { id: reciprocalLike.id },
          data: { status: 'matched' },
        });
      }

      return {
        matched: reciprocalLike ? true : false,
        likeId: like.id,
      };
    } catch (error) {
      this.logger.error(`Error creating like from ${senderId} to ${receiverId}:`, error);
      throw error;
    }
  }

  /**
   * Validate that a match exists between two users
   * Used for permission checks (e.g., can they message each other?)
   */
  async validateMatch(userId1: string, userId2: string): Promise<boolean> {
    const match = await this.prisma.userLike.findFirst({
      where: {
        senderId: userId1,
        receiverId: userId2,
        status: 'matched',
      },
    });

    if (!match) {
      const reciprocal = await this.prisma.userLike.findFirst({
        where: {
          senderId: userId2,
          receiverId: userId1,
          status: 'matched',
        },
      });
      return !!reciprocal;
    }

    return !!match;
  }

  /**
   * Get likes received by a user (premium feature)
   */
  async getLikesReceived(userId: string, limit = 12): Promise<any[]> {
    try {
      const likes = await this.prisma.userLike.findMany({
        where: {
          receiverId: userId,
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              photos: true,
              city: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return likes.map((like) => ({
        id: like.sender.id,
        name: like.sender.displayName,
        image: this.extractPrimaryPhoto(like.sender.photos),
        city: like.sender.city,
        highlight: like.highlight || 'Interested in you',
        verified: like.sender.isVerified,
      }));
    } catch (error) {
      this.logger.error(`Error fetching likes for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get likes sent by a user
   */
  async getLikesSent(userId: string, limit = 12): Promise<any[]> {
    try {
      const likes = await this.prisma.userLike.findMany({
        where: {
          senderId: userId,
        },
        include: {
          receiver: {
            select: {
              id: true,
              displayName: true,
              photos: true,
              city: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return likes.map((like) => ({
        id: like.receiver.id,
        name: like.receiver.displayName,
        image: this.extractPrimaryPhoto(like.receiver.photos),
        city: like.receiver.city,
        highlight: like.highlight || 'You liked them',
        verified: like.receiver.isVerified,
      }));
    } catch (error) {
      this.logger.error(`Error fetching sent likes for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Extract primary photo from photos JSON
   */
  private extractPrimaryPhoto(photos: any): string {
    if (!photos) return 'https://via.placeholder.com/300x300?text=No+Photo';
    if (Array.isArray(photos) && photos.length > 0) return photos[0];
    if (typeof photos === 'object') {
      if (photos.primary) return photos.primary;
      if (photos.gallery && photos.gallery.length > 0) return photos.gallery[0];
    }
    return 'https://via.placeholder.com/300x300?text=No+Photo';
  }
}
