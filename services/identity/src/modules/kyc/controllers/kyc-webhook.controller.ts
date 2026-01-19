import { Body, Controller, Post } from '@nestjs/common';
import { KycService, KycCallbackPayload } from '../services/kyc.service';

@Controller('kyc/webhooks')
export class KycWebhookController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  handleWebhook(@Body() payload: KycCallbackPayload) {
    return this.kycService.handleCallback(payload);
  }
}
