import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/config.service';
import {
  KycProvider,
  ProviderUploadRequest,
  ProviderUploadResponse,
  ProviderVerificationCreate,
  ProviderVerificationDecision,
  ProviderWebhookContext,
} from '../interfaces/kyc-provider.interface';
import { KycUploadService } from '../services/kyc-upload.service';
import { KycCallbackPayload } from '../dto/kyc-callback-payload';

const PROVIDER_STATUSES: KycCallbackPayload['status'][] = ['approved', 'pending', 'rejected'];

@Injectable()
export class MockKycProvider implements KycProvider {
  private readonly logger = new Logger(MockKycProvider.name);

  constructor(
    private readonly config: AppConfigService,
    private readonly uploadService: KycUploadService
  ) {}

  async createVerification(
    input: ProviderVerificationCreate
  ): Promise<{ providerReference: string }> {
    const reference = `${this.config.kyc.provider}-${input.verificationId}`;
    this.logger.debug(`Mock provider creating verification ${reference} for ${input.userId}`);
    return { providerReference: reference };
  }

  getUploadTarget(dto: ProviderUploadRequest): Promise<ProviderUploadResponse> {
    return this.uploadService.generate(dto);
  }

  async parseWebhook(
    payload: unknown,
    context?: ProviderWebhookContext
  ): Promise<ProviderVerificationDecision> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Webhook payload must be an object');
    }

    const record = payload as Record<string, unknown>;
    const verificationId = record['verificationId'];
    const status = record['status'];

    if (typeof verificationId !== 'string' || verificationId.length === 0) {
      throw new BadRequestException('verificationId is required');
    }
    if (
      typeof status !== 'string' ||
      !PROVIDER_STATUSES.includes(status as KycCallbackPayload['status'])
    ) {
      throw new BadRequestException('Unsupported provider status');
    }

    return {
      verificationId,
      provider: this.config.kyc.provider,
      status: status as KycCallbackPayload['status'],
      reference:
        typeof record['reference'] === 'string' ? (record['reference'] as string) : undefined,
      metadata: this.buildMetadata(record['metadata'], context),
    };
  }

  private buildMetadata(
    value: unknown,
    context?: ProviderWebhookContext
  ): Record<string, unknown> | undefined {
    let metadata: Record<string, unknown> | undefined;
    if (value && typeof value === 'object') {
      metadata = value as Record<string, unknown>;
    } else if (value === undefined || value === null) {
      metadata = undefined;
    } else {
      throw new BadRequestException('metadata must be an object when provided');
    }

    return {
      ...metadata,
      source: this.config.kyc.provider,
      receivedAt: new Date().toISOString(),
      ...(context?.timestamp ? { webhookTimestamp: context.timestamp } : {}),
    };
  }
}
