import { Module } from '@nestjs/common';
import { KycWebhookController } from './controllers/kyc-webhook.controller';
import { KycService } from './services/kyc.service';

@Module({
  controllers: [KycWebhookController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
