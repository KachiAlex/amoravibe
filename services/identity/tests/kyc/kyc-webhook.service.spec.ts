import { beforeEach, describe, expect, it } from 'vitest';
import { KycWebhookService } from '../../src/modules/kyc/services/kyc-webhook.service';
import { AppConfigService } from '../../src/config/config.service';

describe('KycWebhookService', () => {
  let config: AppConfigService;
  let service: KycWebhookService;

  beforeEach(() => {
    config = new AppConfigService();
    service = new KycWebhookService(config);
  });

  it('accepts the configured webhook signature and rejects mismatches', () => {
    expect(() => service.validateSignature(config.kyc.webhookSecret)).not.toThrow();
    expect(() => service.validateSignature('invalid')).toThrowError('Invalid webhook signature');
  });

  it('enforces webhook timestamp tolerance window', () => {
    const toleranceMs = config.getKycWebhookToleranceMs();
    const withinTolerance = new Date(Date.now() - toleranceMs / 2).toISOString();
    const outsideTolerance = new Date(Date.now() - toleranceMs - 1000).toISOString();

    expect(() => service.validateTimestamp(withinTolerance)).not.toThrow();
    expect(() => service.validateTimestamp(outsideTolerance)).toThrowError(
      'Webhook timestamp outside tolerance window'
    );
  });

  it('sanitizes payloads and defaults provider metadata', () => {
    const payload = {
      verificationId: 'ver_123',
      provider: config.kyc.provider,
      status: 'approved',
      reference: 'ref_456',
      metadata: { foo: 'bar' },
    };

    const sanitized = service.sanitizePayload(payload);

    expect(sanitized.verificationId).toBe('ver_123');
    expect(sanitized.provider).toBe(config.kyc.provider);
    expect(sanitized.status).toBe('approved');
    expect(sanitized.reference).toBe('ref_456');
    expect(sanitized.metadata).toEqual({ foo: 'bar' });
  });

  it('rejects payloads for unexpected providers', () => {
    const payload = {
      verificationId: 'ver_789',
      provider: 'rogue',
      status: 'approved',
    };

    expect(() => service.sanitizePayload(payload)).toThrowError('Unexpected KYC provider');
  });
});
