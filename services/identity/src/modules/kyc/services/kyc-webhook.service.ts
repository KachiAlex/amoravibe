import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppConfigService } from '../../../config/config.service';
import { KycCallbackPayload } from './kyc.service';

@Injectable()
export class KycWebhookService {
  constructor(private readonly config: AppConfigService) {}

  validateSignature(signature?: string) {
    if (!signature || signature !== this.config.kyc.webhookSecret) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  sanitizePayload(payload: KycCallbackPayload): KycCallbackPayload {
    if (!payload?.verificationId) {
      throw new BadRequestException('verificationId is required');
    }
    if (!payload.status) {
      throw new BadRequestException('status is required');
    }
    const provider = payload.provider ?? this.config.kyc.provider;
    if (provider !== this.config.kyc.provider) {
      throw new BadRequestException('Unexpected KYC provider');
    }
    return {
      verificationId: payload.verificationId,
      provider,
      status: payload.status,
      reference: payload.reference,
      metadata: payload.metadata,
    };
  }
}
