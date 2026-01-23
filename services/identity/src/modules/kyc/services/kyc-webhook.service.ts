import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppConfigService } from '../../../config/config.service';
import { KycCallbackPayload, KycProviderStatus } from '../dto/kyc-callback-payload';

@Injectable()
export class KycWebhookService {
  constructor(private readonly config: AppConfigService) {}

  validateSignature(signature?: string) {
    if (!signature || signature !== this.config.kyc.webhookSecret) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  validateTimestamp(timestamp?: string) {
    if (!timestamp) {
      throw new UnauthorizedException('Missing webhook timestamp');
    }
    const parsed = Date.parse(timestamp);
    if (Number.isNaN(parsed)) {
      throw new UnauthorizedException('Invalid webhook timestamp');
    }
    const tolerance = this.config.getKycWebhookToleranceMs();
    if (Math.abs(Date.now() - parsed) > tolerance) {
      throw new UnauthorizedException('Webhook timestamp outside tolerance window');
    }
  }

  sanitizePayload(payload: unknown): KycCallbackPayload {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Webhook payload must be an object');
    }
    const record = payload as Record<string, unknown>;
    const verificationId = record['verificationId'];
    if (typeof verificationId !== 'string' || verificationId.length === 0) {
      throw new BadRequestException('verificationId is required');
    }
    const status = record['status'];
    if (!this.isProviderStatus(status)) {
      throw new BadRequestException('status is required');
    }
    const providerRaw = record['provider'];
    const provider = typeof providerRaw === 'string' ? providerRaw : this.config.kyc.provider;
    if (provider !== this.config.kyc.provider) {
      throw new BadRequestException('Unexpected KYC provider');
    }
    return {
      verificationId,
      provider,
      status,
      reference:
        typeof record['reference'] === 'string' ? (record['reference'] as string) : undefined,
      metadata: this.extractMetadata(record['metadata']),
    };
  }

  private extractMetadata(value: unknown): Record<string, unknown> | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === 'object') {
      return value as Record<string, unknown>;
    }
    throw new BadRequestException('metadata must be an object');
  }

  private isProviderStatus(value: unknown): value is KycProviderStatus {
    if (typeof value !== 'string') {
      return false;
    }
    return ['approved', 'pending', 'rejected'].includes(value);
  }
}
