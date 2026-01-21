import { BadRequestException, Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost, PresignedPost } from '@aws-sdk/s3-presigned-post';
import { randomUUID } from 'crypto';
import { AppConfigService } from '../../../config/config.service';
import { GenerateKycUploadDto, KycUploadPurpose } from '../dto/generate-kyc-upload.dto';

interface KycUploadResponse extends PresignedPost {
  key: string;
  bucket: string;
  expiresAt: string;
  purpose: KycUploadPurpose;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_FILE_SIZE_BYTES = 5 * 1024; // 5 KB to discourage empty uploads
const IMAGE_MIME_PREFIXES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

@Injectable()
export class KycUploadService {
  private readonly s3: S3Client;

  constructor(private readonly config: AppConfigService) {
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
  }

  async generate(dto: GenerateKycUploadDto): Promise<KycUploadResponse> {
    this.assertContentType(dto);
    const bucket = this.config.kyc.uploadBucket;
    const ttlSeconds = Math.min(this.config.kyc.uploadTtlMinutes * 60, 3600);

    const key = this.buildObjectKey(dto);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    const presigned = await createPresignedPost(this.s3, {
      Bucket: bucket,
      Key: key,
      Fields: {
        key,
        'Content-Type': dto.contentType,
        'x-amz-meta-user-id': dto.userId,
        'x-amz-meta-verification-id': dto.verificationId,
        'x-amz-meta-purpose': dto.purpose,
        ...(dto.label ? { 'x-amz-meta-label': dto.label } : {}),
      },
      Conditions: [
        ['content-length-range', MIN_FILE_SIZE_BYTES, MAX_FILE_SIZE_BYTES],
        ['eq', '$Content-Type', dto.contentType],
        ['starts-with', '$key', this.basePrefix(dto)],
      ],
      Expires: ttlSeconds,
    });

    return {
      ...presigned,
      key,
      bucket,
      expiresAt,
      purpose: dto.purpose,
    };
  }

  private basePrefix(dto: GenerateKycUploadDto) {
    return `kyc/${dto.userId}/${dto.verificationId}/${dto.purpose}/`;
  }

  private buildObjectKey(dto: GenerateKycUploadDto) {
    const sanitizedExt = dto.fileExtension.replace(/^\./, '').toLowerCase();
    const unique = randomUUID();
    return `${this.basePrefix(dto)}${unique}.${sanitizedExt}`;
  }

  private assertContentType(dto: GenerateKycUploadDto) {
    const value = dto.contentType.toLowerCase();
    const allowed = this.allowedContentTypesFor(dto.purpose);
    if (!allowed.some((entry) => this.matchesContentType(entry, value))) {
      throw new BadRequestException(
        `Unsupported content type ${dto.contentType} for ${dto.purpose}`
      );
    }
  }

  private allowedContentTypesFor(purpose: KycUploadPurpose): string[] {
    switch (purpose) {
      case KycUploadPurpose.SELFIE:
        return IMAGE_MIME_PREFIXES;
      case KycUploadPurpose.PROOF_OF_ADDRESS:
        return DOCUMENT_MIME_TYPES;
      case KycUploadPurpose.DOCUMENT:
      default:
        return [...DOCUMENT_MIME_TYPES, ...IMAGE_MIME_PREFIXES];
    }
  }

  private matchesContentType(expected: string, actual: string) {
    if (expected.endsWith('/*')) {
      return actual.startsWith(expected.replace('/*', '/'));
    }
    return expected === actual;
  }
}
