import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  Community,
  CommunityType,
  CommunityVisibility,
  CommunityMembershipStatus,
  CommunityEntryType,
  Orientation,
  Gender,
  DiscoverySpace,
  ReportReason,
  CommunityModerationAction,
} from '@prisma/client';

type EntryRequirements = {
  minTrustScore?: number;
  verifiedOnly?: boolean;
  allowedOrientations?: Orientation[];
  allowedGenders?: Gender[];
  discoverySpaces?: DiscoverySpace[];
  location?: {
    city?: string;
    countryCode?: string;
  };
};

type AllowedInteractions = {
  posts?: boolean;
  comments?: boolean;
  reactions?: boolean;
  viewMembers?: boolean;
  media?: boolean;
};

type EligibilityResult = {
  allowed: boolean;
  reasons: string[];
};

type CommunityPostMediaInput = {
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
};

type UserSummary = {
  id: string;
  trustScore: number;
  isVerified: boolean;
  gender: Gender;
  orientation: Orientation;
  discoverySpace: DiscoverySpace;
  city?: string | null;
  cityCountryCode?: string | null;
};

const DEFAULT_INTERACTIONS: AllowedInteractions = {
  posts: true,
  comments: true,
  reactions: true,
  viewMembers: true,
  media: true,
};

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private parseJsonField<T>(value: Prisma.JsonValue | null, fallback: T): T {
    if (!value) return fallback;
    if (typeof value === 'object') {
      return value as T;
    }
    try {
      return JSON.parse(value as string) as T;
    } catch {
      return fallback;
    }
  }

  private getEntryRequirements(community: Community): EntryRequirements {
    const requirements = this.parseJsonField<EntryRequirements>(community.entryRequirements, {});
    if (community.isVerifiedOnly && !requirements.verifiedOnly) {
      requirements.verifiedOnly = true;
    }
    return requirements;
  }

  private getAllowedInteractions(community: Community): AllowedInteractions {
    const parsed = this.parseJsonField<AllowedInteractions>(
      community.allowedInteractions,
      DEFAULT_INTERACTIONS
    );
    return { ...DEFAULT_INTERACTIONS, ...parsed };
  }

  private async getUserSummary(userId: string): Promise<UserSummary | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        trustScore: true,
        isVerified: true,
        gender: true,
        orientation: true,
        discoverySpace: true,
        city: true,
        cityCountryCode: true,
      },
    });
  }

  private computeEligibility(user: UserSummary | null, community: Community): EligibilityResult {
    const reasons: string[] = [];
    if (!user) {
      reasons.push('User not found');
      return { allowed: false, reasons };
    }

    if (community.archivedAt) {
      reasons.push('Community is archived');
    }

    const requirements = this.getEntryRequirements(community);

    if (requirements.verifiedOnly && !user.isVerified) {
      reasons.push('Verification required');
    }

    if (typeof requirements.minTrustScore === 'number' && user.trustScore < requirements.minTrustScore) {
      reasons.push(`Trust score must be at least ${requirements.minTrustScore}`);
    }

    if (
      requirements.allowedOrientations?.length &&
      !requirements.allowedOrientations.includes(user.orientation)
    ) {
      reasons.push('Orientation not eligible for this community');
    }

    if (requirements.allowedGenders?.length && !requirements.allowedGenders.includes(user.gender)) {
      reasons.push('Gender not eligible for this community');
    }

    if (
      requirements.discoverySpaces?.length &&
      !requirements.discoverySpaces.includes(user.discoverySpace)
    ) {
      reasons.push('Discovery space not eligible');
    }

    if (requirements.location?.city && requirements.location.city !== user.city) {
      reasons.push('Community limited to a specific city');
    }

    if (
      requirements.location?.countryCode &&
      requirements.location.countryCode !== user.cityCountryCode
    ) {
      reasons.push('Community limited to a specific region');
    }

    return { allowed: reasons.length === 0, reasons };
  }

  private async evaluateEligibility(
    userId: string,
    community: Community,
    user?: UserSummary | null
  ): Promise<EligibilityResult> {
    const summary = user ?? (await this.getUserSummary(userId));
    return this.computeEligibility(summary, community);
  }

  private async ensureActiveMember(communityId: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
      select: {
        id: true,
        communityId: true,
        userId: true,
        role: true,
        joinedAt: true,
        leftAt: true,
        status: true,
        banExpiresAt: true,
      },
    });

    if (!member || member.leftAt) {
      return null;
    }

    if (member.status === CommunityMembershipStatus.banned) {
      if (member.banExpiresAt && member.banExpiresAt < new Date()) {
        return this.prisma.communityMember.update({
          where: { id: member.id },
          data: { status: CommunityMembershipStatus.active, banExpiresAt: null },
        });
      }
      return null;
    }

    return member;
  }

  /**
   * Browse communities based on eligibility + filters
   */
  async browseCommunities(
    userId: string,
    filters?: {
      type?: CommunityType;
      search?: string;
      limit?: number;
      skip?: number;
    }
  ) {
    try {
      const limit = Math.min(filters?.limit ?? 20, 100);
      const skip = filters?.skip ?? 0;
      const user = await this.getUserSummary(userId);

      const communities = await this.prisma.community.findMany({
        where: {
          archivedAt: null,
          visibility: CommunityVisibility.public,
          type: filters?.type,
          OR: filters?.search
            ? [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
              ]
            : undefined,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          type: true,
          category: true,
          visibility: true,
          moderationLevel: true,
          entryRequirements: true,
          allowedInteractions: true,
          isVerifiedOnly: true,
          createdAt: true,
          updatedAt: true,
          archivedAt: true,
          archivedReason: true,
          frozenAt: true,
          frozenReason: true,
          creatorId: true,
          memberCount: true,
          verified: true,
          lastActivityAt: true,
          members: {
            where: { userId },
            select: { role: true, joinedAt: true },
          },
          _count: {
            select: { members: true, posts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      });

      return communities.map((community) => ({
        ...community,
        userRole: community.members[0]?.role || null,
        userJoinedAt: community.members[0]?.joinedAt || null,
        eligibility: this.computeEligibility(user, community),
      }));
    } catch (error) {
      console.error('[CommunitiesService] Error browsing communities:', error);
      return [];
    }
  }

  async getCommunityDetail(communityId: string, userId?: string) {
    try {
      const [community, membership] = await Promise.all([
        this.prisma.community.findUnique({
          where: { id: communityId },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            type: true,
            category: true,
            visibility: true,
            moderationLevel: true,
            entryRequirements: true,
            allowedInteractions: true,
            isVerifiedOnly: true,
            createdAt: true,
            updatedAt: true,
            archivedAt: true,
            archivedReason: true,
            frozenAt: true,
            frozenReason: true,
            creatorId: true,
            memberCount: true,
            verified: true,
            lastActivityAt: true,
            _count: {
              select: { members: true, posts: true },
            },
          },
        }),
        userId
          ? this.prisma.communityMember.findUnique({
              where: { communityId_userId: { communityId, userId } },
            })
          : Promise.resolve(null),
      ]);

      if (!community) {
        return null;
      }

      const eligibility = userId ? await this.evaluateEligibility(userId, community) : null;

      return {
        ...community,
        eligibility,
        membership,
        interactions: this.getAllowedInteractions(community),
      };
    } catch (error) {
      console.error('[CommunitiesService] Error loading community detail:', error);
      return null;
    }
  }

  async getUserCommunities(userId: string, limit = 50) {
    try {
      return this.prisma.community.findMany({
        where: {
          members: {
            some: {
              userId,
              leftAt: null,
            },
          },
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          type: true,
          category: true,
          visibility: true,
          moderationLevel: true,
          entryRequirements: true,
          allowedInteractions: true,
          isVerifiedOnly: true,
          createdAt: true,
          updatedAt: true,
          archivedAt: true,
          archivedReason: true,
          frozenAt: true,
          frozenReason: true,
          creatorId: true,
          memberCount: true,
          verified: true,
          lastActivityAt: true,
          _count: {
            select: { members: true, posts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('[CommunitiesService] Error getting user communities:', error);
      return [];
    }
  }

  async evaluateEligibilityForCommunities(userId: string, communityIds: string[]) {
    try {
      const [communities, user] = await Promise.all([
        this.prisma.community.findMany({
          where: { id: { in: communityIds } },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            type: true,
            category: true,
            visibility: true,
            moderationLevel: true,
            entryRequirements: true,
            allowedInteractions: true,
            isVerifiedOnly: true,
            createdAt: true,
            updatedAt: true,
            archivedAt: true,
            archivedReason: true,
            frozenAt: true,
            frozenReason: true,
            creatorId: true,
            memberCount: true,
            verified: true,
            lastActivityAt: true,
          },
        }),
        this.getUserSummary(userId),
      ]);

      return communities.reduce<Record<string, EligibilityResult>>((acc, community) => {
        acc[community.id] = this.computeEligibility(user, community);
        return acc;
      }, {});
    } catch (error) {
      console.error('[CommunitiesService] Error evaluating eligibility batch:', error);
      return {};
    }
  }

  async joinCommunity(
    userId: string,
    communityId: string
  ): Promise<{ status: CommunityMembershipStatus | 'denied'; memberId?: string | null; eligibility: EligibilityResult }>
  {
    try {
      const community = await this.prisma.community.findUnique({ where: { id: communityId } });
      if (!community) {
        return { status: 'denied', eligibility: { allowed: false, reasons: ['Community not found'] } };
      }

      const eligibility = await this.evaluateEligibility(userId, community);
      if (!eligibility.allowed) {
        return { status: 'denied', eligibility };
      }

      const existing = await this.prisma.communityMember.findUnique({
        where: {
          communityId_userId: { communityId, userId },
        },
      });

      let memberId: string | null = existing?.id ?? null;
      let incrementCount = false;

      if (existing && existing.leftAt) {
        await this.prisma.communityMember.update({
          where: { id: existing.id },
          data: {
            leftAt: null,
            status: CommunityMembershipStatus.active,
            joinedAt: new Date(),
            eligibilitySnapshot: eligibility,
          },
        });
        incrementCount = true;
      } else if (!existing) {
        const member = await this.prisma.communityMember.create({
          data: {
            communityId,
            userId,
            role: 'member',
            status: CommunityMembershipStatus.active,
            joinedVia: CommunityEntryType.organic,
            eligibilitySnapshot: eligibility,
          },
        });
        memberId = member.id;
        incrementCount = true;
      }

      if (incrementCount) {
        await this.prisma.community.update({
          where: { id: communityId },
          data: { memberCount: { increment: 1 } },
        });
      }

      return { status: CommunityMembershipStatus.active, eligibility, memberId };
    } catch (error) {
      console.error('[CommunitiesService] Error joining community:', error);
      return {
        status: 'denied',
        eligibility: { allowed: false, reasons: ['Unexpected error joining community'] },
      };
    }
  }

  async leaveCommunity(userId: string, communityId: string): Promise<boolean> {
    try {
      const member = await this.prisma.communityMember.findUnique({
        where: {
          communityId_userId: { communityId, userId },
        },
      });

      if (!member || member.leftAt) {
        return false;
      }

      await this.prisma.communityMember.update({
        where: { id: member.id },
        data: { leftAt: new Date(), status: CommunityMembershipStatus.left },
      });

      await this.prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { decrement: 1 } },
      });

      return true;
    } catch (error) {
      console.error('[CommunitiesService] Error leaving community:', error);
      return false;
    }
  }

  async getCommunityPosts(
    communityId: string,
    userId?: string,
    limit = 20,
    cursor?: string
  ) {
    try {
      const community = await this.prisma.community.findUnique({ where: { id: communityId } });
      if (!community) {
        return { posts: [], nextCursor: null };
      }

      const interactions = this.getAllowedInteractions(community);
      if (!interactions.posts) {
          return { posts: [], nextCursor: null };
      }

      if (community.visibility !== CommunityVisibility.public && userId) {
        const member = await this.ensureActiveMember(communityId, userId);
        if (!member) {
          return { posts: [], nextCursor: null };
        }
      }

      const posts = await this.prisma.communityPost.findMany({
        where: { communityId, deletedAt: null },
        include: {
          author: {
            select: { id: true, displayName: true, isVerified: true },
          },
          media: true,
          _count: {
            select: { comments: true, reactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });

      const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;
      return { posts, nextCursor };
    } catch (error) {
      console.error('[CommunitiesService] Error getting community posts:', error);
      return { posts: [], nextCursor: null };
    }
  }

  async createPost(
    communityId: string,
    userId: string,
    content: string,
    media?: CommunityPostMediaInput[]
  ): Promise<string | null> {
    try {
      const [community, member] = await Promise.all([
        this.prisma.community.findUnique({ where: { id: communityId } }),
        this.ensureActiveMember(communityId, userId),
      ]);

      if (!community || !member) {
        return null;
      }

      if (community.frozenAt) {
        return null;
      }

      const interactions = this.getAllowedInteractions(community);
      if (!interactions.posts) {
        return null;
      }

      const post = await this.prisma.communityPost.create({
        data: {
          communityId,
          userId,
          content,
          mediaCount: media?.length ?? 0,
        },
      });

      if (media?.length) {
        await this.prisma.communityPostMedia.createMany({
          data: media.map((asset) => ({
            postId: post.id,
            url: asset.url,
            mimeType: asset.mimeType,
            width: asset.width,
            height: asset.height,
          })),
        });
      }

      await this.prisma.community.update({
        where: { id: communityId },
        data: { lastActivityAt: new Date() },
      });

      return post.id;
    } catch (error) {
      console.error('[CommunitiesService] Error creating post:', error);
      return null;
    }
  }

  async commentOnPost(postId: string, userId: string, content: string): Promise<string | null> {
    try {
      const post = await this.prisma.communityPost.findUnique({
        where: { id: postId },
        select: { communityId: true },
      });

      if (!post) {
        return null;
      }

      const member = await this.ensureActiveMember(post.communityId, userId);
      if (!member) {
        return null;
      }

      const comment = await this.prisma.communityComment.create({
        data: { postId, userId, content },
      });

      return comment.id;
    } catch (error) {
      console.error('[CommunitiesService] Error adding comment:', error);
      return null;
    }
  }

  async reactToPost(postId: string, userId: string, type = 'like'): Promise<boolean> {
    try {
      const post = await this.prisma.communityPost.findUnique({
        where: { id: postId },
        select: { communityId: true },
      });

      if (!post) {
        return false;
      }

      const member = await this.ensureActiveMember(post.communityId, userId);
      if (!member) {
        return false;
      }

      await this.prisma.communityReaction.upsert({
        where: { postId_userId_type: { postId, userId, type } },
        create: { postId, userId, type },
        update: {},
      });

      return true;
    } catch (error) {
      console.error('[CommunitiesService] Error reacting to post:', error);
      return false;
    }
  }

  async getCommunityMembers(communityId: string, limit = 50) {
    try {
      const community = await this.prisma.community.findUnique({ where: { id: communityId } });
      if (!community) {
        return [];
      }

      const interactions = this.getAllowedInteractions(community);
      if (!interactions.viewMembers) {
        return [];
      }

      return this.prisma.communityMember.findMany({
        where: { communityId, leftAt: null },
        include: {
          user: {
            select: { id: true, displayName: true, isVerified: true },
          },
        },
        take: limit,
        orderBy: { joinedAt: 'asc' },
      });
    } catch (error) {
      console.error('[CommunitiesService] Error getting community members:', error);
      return [];
    }
  }

  async getUserRoleInCommunity(userId: string, communityId: string): Promise<string | null> {
    try {
      const member = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId, userId } },
      });

      return member?.leftAt ? null : member?.role || null;
    } catch (error) {
      console.error('[CommunitiesService] Error getting user role:', error);
      return null;
    }
  }

  async reportPost(
    postId: string,
    reporterId: string,
    reason: ReportReason,
    description?: string,
    evidence?: string[]
  ): Promise<string | null> {
    try {
      const post = await this.prisma.communityPost.findUnique({
        where: { id: postId },
        select: { communityId: true, userId: true },
      });

      if (!post) {
        return null;
      }

      const member = await this.ensureActiveMember(post.communityId, reporterId);
      if (!member) {
        return null;
      }

      const report = await this.prisma.communityPostReport.create({
        data: {
          postId,
          reporterId,
          reason,
          description,
          evidence,
        },
      });

      await this.prisma.safetyReport.create({
        data: {
          reporterId,
          reportedUserId: post.userId,
          reportedPostId: postId,
          reason,
          description: description ?? 'Community post report',
          evidence: evidence?.length ? JSON.stringify(evidence) : null,
        },
      });

      return report.id;
    } catch (error) {
      console.error('[CommunitiesService] Error reporting post:', error);
      return null;
    }
  }

  async freezeCommunity(communityId: string, actorId: string, reason: string): Promise<boolean> {
    try {
      await this.prisma.community.update({
        where: { id: communityId },
        data: { frozenAt: new Date(), frozenReason: reason },
      });

      await this.prisma.communityModerationLog.create({
        data: {
          communityId,
          actorId,
          action: CommunityModerationAction.freeze,
          reason,
        },
      });

      return true;
    } catch (error) {
      console.error('[CommunitiesService] Error freezing community:', error);
      return false;
    }
  }

  async unfreezeCommunity(communityId: string, actorId: string): Promise<boolean> {
    try {
      await this.prisma.community.update({
        where: { id: communityId },
        data: { frozenAt: null, frozenReason: null },
      });

      await this.prisma.communityModerationLog.create({
        data: {
          communityId,
          actorId,
          action: CommunityModerationAction.unfreeze,
          reason: 'Community activity restored',
        },
      });

      return true;
    } catch (error) {
      console.error('[CommunitiesService] Error unfreezing community:', error);
      return false;
    }
  }

  async archiveCommunity(communityId: string, actorId: string, reason: string): Promise<boolean> {
    try {
      await this.prisma.community.update({
        where: { id: communityId },
        data: { archivedAt: new Date(), archivedReason: reason },
      });

      await this.prisma.communityModerationLog.create({
        data: {
          communityId,
          actorId,
          action: CommunityModerationAction.archive,
          reason,
        },
      });

      return true;
    } catch (error) {
      console.error('[CommunitiesService] Error archiving community:', error);
      return false;
    }
  }

  async banMember(
    communityId: string,
    memberId: string,
    actorId: string,
    reason: string,
    durationMinutes?: number
  ): Promise<boolean> {
    try {
      const membership = await this.prisma.communityMember.findUnique({ where: { id: memberId } });
      if (!membership) {
        return false;
      }

      const banExpiresAt = durationMinutes
        ? new Date(Date.now() + durationMinutes * 60 * 1000)
        : null;

      await this.prisma.communityMember.update({
        where: { id: memberId },
        data: {
          status: CommunityMembershipStatus.banned,
          leftAt: new Date(),
          banExpiresAt,
        },
      });

      if (!membership.leftAt) {
        await this.prisma.community.update({
          where: { id: communityId },
          data: { memberCount: { decrement: 1 } },
        });
      }

      await this.prisma.communityModerationLog.create({
        data: {
          communityId,
          actorId,
          targetUserId: membership.userId,
          action: CommunityModerationAction.ban,
          reason,
          metadata: banExpiresAt ? { banExpiresAt: banExpiresAt.toISOString() } : undefined,
        },
      });

      return true;
    } catch (error) {
      console.error('[CommunitiesService] Error banning community member:', error);
      return false;
    }
  }
}
