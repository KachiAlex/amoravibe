import { ProfileMediaType as RequestMediaType } from '../../common/enums/profile-media-type.enum';
import { ProfileMediaStatus as MediaStatusEnum } from '../../common/enums/profile-media-status.enum';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost, PresignedPost } from '@aws-sdk/s3-presigned-post';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileConfigService } from '../../config/config.service';
import { RequestMediaUploadDto } from './dto/request-media-upload.dto';
import { CompleteMediaUploadDto } from './dto/complete-media-upload.dto';
import type {
  ProfileMediaStatus as PrismaMediaStatus,
  ProfileMediaType as PrismaMediaType,
  VisibilityPool as PrismaVisibilityPool,
} from '../../prisma/client';

export interface MediaUploadResponse extends PresignedPost {
  mediaId: string;
  key: string;
  bucket: string;
  expiresAt: string;
  visibility: string;
}

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly maxBytes: number;
  private readonly minBytes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ProfileConfigService
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              sessionToken: process.env.AWS_SESSION_TOKEN,
            }
          : undefined,
    });
    this.maxBytes = this.config.media.maxFileSizeMb * 1024 * 1024;
    this.minBytes = this.config.media.minFileSizeKb * 1024;
  }

  async requestUpload(profileId: string, dto: RequestMediaUploadDto): Promise<MediaUploadResponse> {
    await this.assertProfileExists(profileId);
    this.assertContentType(dto.type, dto.contentType);

    const bucket = this.config.media.uploadBucket;
    const key = this.buildStorageKey(profileId, dto.type, dto.fileExtension);
    const expiresSeconds = Math.min(this.config.media.uploadTtlMinutes * 60, 3600);
    const expiresAt = new Date(Date.now() + expiresSeconds * 1000).toISOString();

    const presigned = await createPresignedPost(this.s3, {
      Bucket: bucket,
      Key: key,
      Fields: {
        key,
        'Content-Type': dto.contentType,
        'x-amz-meta-profile-id': profileId,
        'x-amz-meta-media-type': dto.type,
        'x-amz-meta-visibility': dto.visibility,
        ...(dto.label ? { 'x-amz-meta-label': dto.label } : {}),
      },
      Conditions: [
        ['content-length-range', this.minBytes, this.maxBytes],
        ['eq', '$Content-Type', dto.contentType],
        ['starts-with', '$key', this.basePrefix(profileId, dto.type)],
      ],
      Expires: expiresSeconds,
    });

    const media = await this.prisma.profileMedia.create({
      data: {
        profileId,
        type: dto.type as unknown as PrismaMediaType,
        status: MediaStatusEnum.PENDING as unknown as PrismaMediaStatus,
        visibility: dto.visibility as unknown as PrismaVisibilityPool,
        storageKey: key,
        bucket,
        label: dto.label ?? null,
        metadata: {
          requestedAt: new Date().toISOString(),
          contentType: dto.contentType,
        },
      },
    });

    return {
      ...presigned,
      mediaId: media.id,
      key,
      bucket,
      expiresAt,
      visibility: dto.visibility,
    };
  }

  async completeUpload(profileId: string, mediaId: string, dto: CompleteMediaUploadDto) {
    const media = await this.prisma.profileMedia.findUnique({ where: { id: mediaId } });
    if (!media || media.profileId !== profileId) {
      throw new NotFoundException('Media asset not found for this profile');
    }

    if (media.status !== (MediaStatusEnum.PENDING as PrismaMediaStatus)) {
      throw new BadRequestException('Only pending uploads can be completed');
    }

    return this.prisma.profileMedia.update({
      where: { id: mediaId },
      data: {
        status: MediaStatusEnum.PROCESSING as unknown as PrismaMediaStatus,
        checksum: dto.checksum ?? media.checksum,
        metadata: {
          ...(media.metadata as Record<string, unknown> | null),
          moderationContext: dto.moderationContext ?? null,
          completedAt: new Date().toISOString(),
        },
      },
    });
  }

  private async assertProfileExists(profileId: string) {
    const exists = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!exists) {
      throw new NotFoundException('Profile not found');
    }
  }

  private assertContentType(type: RequestMediaType, contentType: string) {
    const allowedPrefixes =
      type === RequestMediaType.PHOTO
        ? this.config.media.allowedPhotoMimePrefixes
        : this.config.media.allowedVideoMimePrefixes;
    const normalized = contentType.toLowerCase();
    const matches = allowedPrefixes.some((prefix) => normalized.startsWith(prefix.toLowerCase()));
    if (!matches) {
      throw new BadRequestException(`Unsupported content type ${contentType} for ${type}`);
    }
  }

  private basePrefix(profileId: string, type: RequestMediaType) {
    return `profiles/${profileId}/${type}/`;
  }

  private buildStorageKey(profileId: string, type: RequestMediaType, extension: string) {
    const sanitizedExt = extension.replace(/^\./, '').toLowerCase();
    const unique = randomUUID();
    return `${this.basePrefix(profileId, type)}${unique}.${sanitizedExt}`;
  }
}
