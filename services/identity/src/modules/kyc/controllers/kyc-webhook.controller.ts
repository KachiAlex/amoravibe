import { Body, Controller, Headers, Post } from '@nestjs/common';
import { KycService } from '../services/kyc.service';
import { KycWebhookService } from '../services/kyc-webhook.service';

@Controller('kyc/webhooks')
export class KycWebhookController {
  constructor(
    private readonly kycService: KycService,
    private readonly webhookService: KycWebhookService
  ) {}

  @Post()
  handleWebhook(
    @Body() payload: unknown,
    @Headers('x-kyc-signature') signature?: string,
    @Headers('x-kyc-timestamp') timestamp?: string
  ) {
    this.webhookService.validateSignature(signature);
    this.webhookService.validateTimestamp(timestamp);
    const sanitized = this.webhookService.sanitizePayload(payload);
    return this.kycService.handleCallback(sanitized);
  }
}
