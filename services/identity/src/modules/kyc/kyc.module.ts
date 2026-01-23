import { Module } from '@nestjs/common';
import { KycWebhookController } from './controllers/kyc-webhook.controller';
import { KycService } from './services/kyc.service';
import { KycWebhookService } from './services/kyc-webhook.service';
import { KycUploadController } from './controllers/kyc-upload.controller';
import { KycUploadService } from './services/kyc-upload.service';
import { ConfigModule } from '../../config/config.module';
import { VerificationModule } from '../verification/verification.module';
import { MockKycProvider } from './providers/mock-kyc.provider';
import { KYC_PROVIDER_TOKEN } from './kyc.constants';
import { KycAdapterService } from './services/kyc-adapter.service';

@Module({
  imports: [ConfigModule, VerificationModule],
  controllers: [KycWebhookController, KycUploadController],
  providers: [
    KycService,
    KycWebhookService,
    KycUploadService,
    KycAdapterService,
    MockKycProvider,
    {
      provide: KYC_PROVIDER_TOKEN,
      useExisting: MockKycProvider,
    },
  ],
  exports: [KycService, KycAdapterService, MockKycProvider, KYC_PROVIDER_TOKEN],
})
export class KycModule {}
