import { Inject, Injectable, Logger } from '@nestjs/common';
import { Verification } from '@prisma/client';
import { VerificationService } from '../../verification/services/verification.service';
import { KYC_PROVIDER_TOKEN } from '../kyc.constants';
import { KycProvider } from '../interfaces/kyc-provider.interface';
import { InitiateVerificationDto } from '../../verification/dto/initiate-verification.dto';

@Injectable()
export class KycAdapterService {
  private readonly logger = new Logger(KycAdapterService.name);

  constructor(
    private readonly verificationService: VerificationService,
    @Inject(KYC_PROVIDER_TOKEN) private readonly provider: KycProvider
  ) {}

  async initiate(dto: InitiateVerificationDto): Promise<Verification> {
    const verification = await this.verificationService.initiate(dto);

    try {
      const { providerReference } = await this.provider.createVerification({
        userId: dto.userId,
        verificationId: verification.id,
      });

      if (providerReference) {
        return this.verificationService.attachProviderReference(verification.id, providerReference);
      }

      return verification;
    } catch (error) {
      this.logger.error(
        `Failed to create provider verification for ${verification.id}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
