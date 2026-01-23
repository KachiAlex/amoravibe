import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VisibilityService } from '../../src/modules/visibility/visibility.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  ProfileMediaStatus,
  ProfileMediaType,
  VisibilityPool as PrismaVisibilityPool,
} from '../../src/prisma/client';
import { VisibilityPool } from '../../src/common/enums/visibility-pool.enum';

const defaultVersion = {
  id: 'version-id',
  profileId: 'profile-id',
  displayName: 'Taylor',
  pronouns: 'they/them',
  bio: 'Adventure seeker',
  orientation: 'heterosexual',
  lifestyleTags: ['outdoors'],
  handle: 'tay',
};

describe('VisibilityService', () => {
  let prismaMock: {
    profile: { findUnique: ReturnType<typeof vi.fn> };
    profileMedia: { findMany: ReturnType<typeof vi.fn> };
    profileVisibilityRule: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
  let service: VisibilityService;

  beforeEach(() => {
    prismaMock = {
      profile: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'profile-id',
          userId: 'user-id',
          currentVersion: defaultVersion,
        }),
      },
      profileMedia: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      profileVisibilityRule: {
        findMany: vi.fn(),
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new VisibilityService(prismaMock as unknown as PrismaService);
  });

  it('builds visible payloads using default fields and approved media when no overrides exist', async () => {
    prismaMock.profileMedia.findMany.mockResolvedValue([
      {
        id: 'm1',
        profileId: 'profile-id',
        visibility: PrismaVisibilityPool.hetero,
        status: ProfileMediaStatus.approved,
        type: ProfileMediaType.photo,
        label: 'primary',
      },
      {
        id: 'm2',
        profileId: 'profile-id',
        visibility: PrismaVisibilityPool.hetero,
        status: ProfileMediaStatus.pending,
        type: ProfileMediaType.photo,
      },
      {
        id: 'm3',
        profileId: 'profile-id',
        visibility: PrismaVisibilityPool.lgbtq,
        status: ProfileMediaStatus.approved,
        type: ProfileMediaType.photo,
      },
    ]);

    const payload = await service.getVisibleProfile('profile-id', VisibilityPool.HETERO);

    expect(payload.fields).toMatchObject({
      displayName: defaultVersion.displayName,
      pronouns: defaultVersion.pronouns,
      bio: defaultVersion.bio,
      orientation: defaultVersion.orientation,
      lifestyleTags: defaultVersion.lifestyleTags,
      handle: defaultVersion.handle,
    });
    expect(Object.keys(payload.fields).length).toBeGreaterThanOrEqual(5);
    expect(payload.media).toHaveLength(1);
    expect(payload.media[0]).toMatchObject({ id: 'm1', visibility: PrismaVisibilityPool.hetero });
  });

  it('applies visibility rule overrides for specific fields and media ids', async () => {
    prismaMock.profileVisibilityRule.findUnique.mockResolvedValue({
      profileId: 'profile-id',
      pool: PrismaVisibilityPool.lgbtq,
      visibleFields: ['bio'],
      visibleMediaIds: ['m3'],
    });

    prismaMock.profileMedia.findMany.mockResolvedValue([
      {
        id: 'm3',
        profileId: 'profile-id',
        visibility: PrismaVisibilityPool.both,
        status: ProfileMediaStatus.approved,
        type: ProfileMediaType.photo,
        label: 'concert',
      },
      {
        id: 'm4',
        profileId: 'profile-id',
        visibility: PrismaVisibilityPool.lgbtq,
        status: ProfileMediaStatus.approved,
        type: ProfileMediaType.photo,
      },
    ]);

    const payload = await service.getVisibleProfile('profile-id', VisibilityPool.LGBTQ);

    expect(payload.fields).toEqual({ bio: defaultVersion.bio });
    expect(payload.media).toHaveLength(1);
    expect(payload.media[0]).toMatchObject({ id: 'm3', label: 'concert' });
  });
});
