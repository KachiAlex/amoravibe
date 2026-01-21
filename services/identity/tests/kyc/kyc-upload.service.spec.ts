import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KycUploadService } from '../../src/modules/kyc/services/kyc-upload.service';
import { KycUploadPurpose } from '../../src/modules/kyc/dto/generate-kyc-upload.dto';
import { AppConfigService } from '../../src/config/config.service';

const createPresignedPostMock = vi.fn(async () => ({
  url: 'https://uploads.lovedate.test',
  fields: { Policy: 'stub-policy', 'x-amz-signature': 'stub-signature' },
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({ config: {} })),
}));

vi.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: (...args: unknown[]) => createPresignedPostMock(...args),
}));

describe('KycUploadService', () => {
  const baseConfig: AppConfigService['kyc'] = {
    provider: 'persona',
    apiBaseUrl: 'https://persona.test',
    apiKey: 'stub-key',
    webhookSecret: 'stub-secret',
    uploadBucket: 'pii-bucket',
    uploadTtlMinutes: 30,
  };

  let service: KycUploadService;

  beforeEach(() => {
    vi.clearAllMocks();
    const config = { kyc: baseConfig } as AppConfigService;
    service = new KycUploadService(config);
  });

  it('generates presigned uploads scoped to the user/verification/purpose prefix', async () => {
    const dto = {
      userId: '2b1b8f16-539a-4db1-98c1-2c7ce3c5ab32',
      verificationId: 'eecb400c-8d2b-4938-933f-7d0c6e4da9c6',
      purpose: KycUploadPurpose.DOCUMENT,
      fileExtension: 'jpg',
      contentType: 'image/jpeg',
      label: 'passport',
    };

    const response = await service.generate(dto);

    expect(createPresignedPostMock).toHaveBeenCalledTimes(1);
    const [, options] = createPresignedPostMock.mock.calls[0];
    expect(options).toMatchObject({
      Bucket: baseConfig.uploadBucket,
      Fields: expect.objectContaining({
        'x-amz-meta-user-id': dto.userId,
        'x-amz-meta-verification-id': dto.verificationId,
        'x-amz-meta-purpose': dto.purpose,
        'x-amz-meta-label': dto.label,
      }),
    });
    expect(options.Key).toBeUndefined();
    expect(Array.isArray(options.Conditions)).toBe(true);

    expect(response.bucket).toBe(baseConfig.uploadBucket);
    expect(response.key.startsWith(`kyc/${dto.userId}/${dto.verificationId}/${dto.purpose}/`)).toBe(
      true
    );
    expect(response.expiresAt).toBeDefined();
  });

  it('rejects unsupported content types for the given purpose', async () => {
    await expect(
      service.generate({
        userId: 'c8b12eb0-65f5-45a2-a4f6-8c7df0a7b5fd',
        verificationId: '0de0e5f0-6240-4cf4-8c99-9c61b1bd7c3a',
        purpose: KycUploadPurpose.SELFIE,
        fileExtension: 'pdf',
        contentType: 'application/pdf',
      })
    ).rejects.toThrow(/Unsupported content type/i);
  });
});
