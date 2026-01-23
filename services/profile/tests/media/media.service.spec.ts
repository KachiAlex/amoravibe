import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaService } from '../../src/modules/media/media.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ProfileConfigService } from '../../src/config/config.service';
import { RequestMediaUploadDto } from '../../src/modules/media/dto/request-media-upload.dto';
import { CompleteMediaUploadDto } from '../../src/modules/media/dto/complete-media-upload.dto';
import { VisibilityPool as PrismaVisibilityPool } from '../../src/prisma/client';
import { ProfileMediaType as RequestMediaType } from '../../src/common/enums/profile-media-type.enum';
import { VisibilityPool } from '../../src/common/enums/visibility-pool.enum';
import { ProfileMediaStatus } from '../../src/common/enums/profile-media-status.enum';

class StubProfileConfigService extends ProfileConfigService {
  constructor(private readonly mediaConfig: ProfileConfigService['media']) {
    super();
  }

  override get media() {
    return this.mediaConfig;
  }
}

const createPresignedPostMock = vi.fn(async () => ({
  url: 'https://uploads.profile.test',
  fields: { Policy: 'stub-policy', 'X-Amz-Signature': 'stub-signature' },
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({ config: {} })),
}));

vi.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: (...args: unknown[]) => createPresignedPostMock(...args),
}));

describe('MediaService', () => {
  let prismaMock: {
    profile: { findUnique: ReturnType<typeof vi.fn> };
    profileMedia: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let prisma: PrismaService;
  let config: ProfileConfigService;
  let service: MediaService;

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock = {
      profile: {
        findUnique: vi.fn().mockResolvedValue({ id: 'profile-id' }),
      },
      profileMedia: {
        create: vi.fn().mockResolvedValue({ id: 'media-id' }),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    prisma = prismaMock as unknown as PrismaService;

    config = new StubProfileConfigService({
      uploadBucket: 'profile-media',
      uploadTtlMinutes: 10,
      maxFileSizeMb: 5,
      minFileSizeKb: 5,
      allowedPhotoMimePrefixes: ['image/jpeg'],
      allowedVideoMimePrefixes: ['video/mp4'],
    });

    service = new MediaService(prisma, config);
  });

  it('issues presigned uploads and persists metadata', async () => {
    const dto: RequestMediaUploadDto = {
      type: RequestMediaType.PHOTO,
      visibility: VisibilityPool.HETERO,
      contentType: 'image/jpeg',
      fileExtension: '.jpg',
      label: 'primary',
    };

    const response = await service.requestUpload('profile-id', dto);

    expect(createPresignedPostMock).toHaveBeenCalledTimes(1);
    const [, presignOptions] = createPresignedPostMock.mock.calls[0];
    expect(presignOptions).toMatchObject({ Bucket: config.media.uploadBucket });

    expect(prismaMock.profileMedia.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          profileId: 'profile-id',
          visibility: dto.visibility as unknown as PrismaVisibilityPool,
          label: dto.label,
        }),
      })
    );

    expect(response.mediaId).toBe('media-id');
    expect(response.bucket).toBe(config.media.uploadBucket);
    expect(response.key.startsWith('profiles/profile-id/photo/')).toBe(true);
    expect(response.visibility).toBe(dto.visibility);
  });

  it('completes uploads by transitioning them to processing', async () => {
    prismaMock.profileMedia.findUnique.mockResolvedValue({
      id: 'media-id',
      profileId: 'profile-id',
      status: ProfileMediaStatus.PENDING,
      checksum: null,
      metadata: null,
    });
    prismaMock.profileMedia.update.mockResolvedValue({
      id: 'media-id',
      status: ProfileMediaStatus.PROCESSING,
    });

    const dto: CompleteMediaUploadDto = {
      checksum: 'abc123',
      moderationContext: { client: 'mobile' },
    };

    const result = await service.completeUpload('profile-id', 'media-id', dto);

    expect(prismaMock.profileMedia.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'media-id' },
        data: expect.objectContaining({ status: ProfileMediaStatus.PROCESSING }),
      })
    );
    expect(result.status).toBe(ProfileMediaStatus.PROCESSING);
  });

  it('rejects completion for media belonging to another profile', async () => {
    prismaMock.profileMedia.findUnique.mockResolvedValue({
      id: 'media-id',
      profileId: 'different-profile',
      status: ProfileMediaStatus.PENDING,
    });

    await expect(
      service.completeUpload('profile-id', 'media-id', {
        checksum: undefined,
        moderationContext: undefined,
      })
    ).rejects.toThrow(/Media asset not found/i);
  });
});
