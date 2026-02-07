import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Community, Prisma } from '@prisma/client';

const prismaEnums = vi.hoisted(() => ({
  CommunityCategory: {
    interest: 'interest',
    identity: 'identity',
    location: 'location',
    campus: 'campus',
    event: 'event',
    verified_only: 'verified_only',
  },
  CommunityType: {
    interest: 'interest',
    identity: 'identity',
    location: 'location',
    verified: 'verified',
  },
  CommunityVisibility: {
    public: 'public',
    private: 'private',
    restricted: 'restricted',
  },
  CommunityMembershipStatus: {
    pending: 'pending',
    active: 'active',
    muted: 'muted',
    banned: 'banned',
    left: 'left',
  },
  CommunityEntryType: {
    organic: 'organic',
    invite: 'invite',
    auto: 'auto',
    staff: 'staff',
  },
  CommunityPostVisibility: {
    everyone: 'everyone',
    members: 'members',
    moderators: 'moderators',
  },
  CommunityPostMedia: {
    image: 'image',
    video: 'video',
    link: 'link',
  },
  ModerationLevel: {
    permissive: 'permissive',
    moderate: 'moderate',
    strict: 'strict',
  },
  Orientation: {
    heterosexual: 'heterosexual',
    gay: 'gay',
    bisexual: 'bisexual',
  },
  Gender: {
    man: 'man',
    woman: 'woman',
  },
  DiscoverySpace: {
    straight: 'straight',
    lgbtq: 'lgbtq',
    both: 'both',
  },
  ReportReason: {
    hate_speech: 'hate_speech',
    harassment: 'harassment',
  },
  CommunityFreezeReason: {
    safety: 'safety',
    spam: 'spam',
    compliance: 'compliance',
  },
  CommunityModerationAction: {
    freeze: 'freeze',
    unfreeze: 'unfreeze',
    archive: 'archive',
    ban: 'ban',
  },
}));

vi.mock('@prisma/client', () => ({
  Prisma: {},
  ...prismaEnums,
}));

const {
  CommunityCategory,
  CommunityType,
  CommunityVisibility,
  CommunityFreezeReason,
  CommunityModerationAction,
  CommunityPostMedia,
  ModerationLevel,
  ReportReason,
  CommunityMembershipStatus,
  DiscoverySpace,
  Orientation,
  Gender,
} = prismaEnums;
import { CommunitiesService } from '../../src/modules/communities/communities.service';
import { PrismaService } from '../../src/prisma/prisma.service';

type PrismaMock = ReturnType<typeof createPrismaMock>;

const baseDate = new Date('2024-01-01T00:00:00.000Z');

const baseUserSummary = () => ({
  id: 'user-1',
  trustScore: 85,
  isVerified: true,
  gender: Gender.man,
  orientation: Orientation.heterosexual,
  discoverySpace: DiscoverySpace.straight,
  city: 'Brooklyn',
  cityCountryCode: 'US',
});

const createCommunity = (overrides: Partial<Community> = {}): Community => ({
  id: 'community-1',
  slug: 'community-1',
  name: 'Lovedate Gardeners',
  description: 'A calm space for plant parents.',
  type: CommunityType.interest,
  category: CommunityCategory.interest,
  visibility: CommunityVisibility.public,
  moderationLevel: ModerationLevel.moderate,
  entryRequirements: null,
  allowedInteractions: null,
  isVerifiedOnly: false,
  createdAt: baseDate,
  updatedAt: baseDate,
  archivedAt: null,
  archivedReason: null,
  frozenAt: null,
  frozenReason: null,
  creatorId: 'creator-1',
  memberCount: 42,
  verified: false,
  lastActivityAt: null,
  ...overrides,
});

function createPrismaMock() {
  return {
    community: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    communityMember: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    communityPost: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    communityPostMedia: {
      createMany: vi.fn(),
    },
    communityPostReport: {
      create: vi.fn(),
    },
    safetyReport: {
      create: vi.fn(),
    },
    communityModerationLog: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  } as const;
}

describe('CommunitiesService safeguards', () => {
  let prisma: PrismaMock;
  let service: CommunitiesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CommunitiesService(prisma as unknown as PrismaService);
  });

  it('denies join when trust requirement is not met', async () => {
    prisma.community.findUnique.mockResolvedValue(
      createCommunity({
        entryRequirements: { minTrustScore: 90 } as unknown as Prisma.JsonValue,
      })
    );
    prisma.user.findUnique.mockResolvedValue({
      ...baseUserSummary(),
      trustScore: 70,
    });
    prisma.communityMember.findUnique.mockResolvedValue(null);

    const result = await service.joinCommunity('user-1', 'community-1');

    expect(result.status).toBe('denied');
    expect(result.eligibility.allowed).toBe(false);
    expect(result.eligibility.reasons[0]).toMatch(/trust/i);
    expect(prisma.communityMember.create).not.toHaveBeenCalled();
  });

  it('activates membership and increments counts when eligible', async () => {
    prisma.community.findUnique.mockResolvedValue(
      createCommunity({
        entryRequirements: { minTrustScore: 40 } as unknown as Prisma.JsonValue,
      })
    );
    prisma.user.findUnique.mockResolvedValue({
      ...baseUserSummary(),
      trustScore: 95,
      isVerified: true,
    });
    prisma.communityMember.findUnique.mockResolvedValue(null);
    prisma.communityMember.create.mockResolvedValue({ id: 'member-123' });

    const result = await service.joinCommunity('user-1', 'community-1');

    expect(result.status).toBe(CommunityMembershipStatus.active);
    expect(result.memberId).toBe('member-123');
    expect(prisma.communityMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ communityId: 'community-1', userId: 'user-1' }),
      })
    );
    expect(prisma.community.update).toHaveBeenCalledWith({
      where: { id: 'community-1' },
      data: { memberCount: { increment: 1 } },
    });
  });

  it('short-circuits feed when posting is disabled for the community', async () => {
    prisma.community.findUnique.mockResolvedValue(
      createCommunity({
        allowedInteractions: { posts: false } as unknown as Prisma.JsonValue,
      })
    );

    const result = await service.getCommunityPosts('community-1', 'user-1');

    expect(result.posts).toHaveLength(0);
    expect(result.nextCursor).toBeNull();
    expect(prisma.communityPost.findMany).not.toHaveBeenCalled();
  });

  it('records safety + moderation metadata when reporting a post', async () => {
    prisma.communityPost.findUnique.mockResolvedValue({ communityId: 'community-1', userId: 'author-1' });
    prisma.communityMember.findUnique.mockResolvedValue({
      id: 'member-1',
      communityId: 'community-1',
      userId: 'reporter-1',
      status: CommunityMembershipStatus.active,
      leftAt: null,
    });
    prisma.communityPostReport.create.mockResolvedValue({ id: 'report-1' });

    const reportId = await service.reportPost(
      'post-1',
      'reporter-1',
      ReportReason.hate_speech,
      'harassment content',
      ['https://example.com/evidence.png']
    );

    expect(reportId).toBe('report-1');
    expect(prisma.communityPostReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reason: ReportReason.hate_speech })
      })
    );
    expect(prisma.safetyReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reportedPostId: 'post-1', reason: ReportReason.hate_speech })
      })
    );
  });

  it('logs moderation events when freezing a community', async () => {
    prisma.community.update.mockResolvedValue({});

    const success = await service.freezeCommunity('community-1', 'moderator-1', 'spam spike');

    expect(success).toBe(true);
    expect(prisma.community.update).toHaveBeenCalledWith({
      where: { id: 'community-1' },
      data: expect.objectContaining({ frozenAt: expect.any(Date) }),
    });
    expect(prisma.communityModerationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          communityId: 'community-1',
          actorId: 'moderator-1',
          action: expect.stringMatching(/freeze/i),
        })
      })
    );
  });
});
