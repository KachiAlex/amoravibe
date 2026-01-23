import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { VerificationService } from '../../verification/services/verification.service';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';
import { KycCallbackPayload } from '../dto/kyc-callback-payload';

export interface KycCallbackResult {
  verification: Awaited<ReturnType<VerificationService['findById']>>;
  alerts: string[];
}

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(private readonly verificationService: VerificationService) {}

  async handleCallback(payload: KycCallbackPayload): Promise<KycCallbackResult> {
    this.logger.log(`Received KYC callback for ${payload.verificationId} from ${payload.provider}`);

    const status = this.mapStatus(payload.status);
    const alerts = this.deriveAlerts(status, payload);

    const verification = await this.verificationService.applyProviderDecision(
      payload.verificationId,
      {
        status,
        reference: payload.reference,
        metadata: {
          ...payload.metadata,
          provider: payload.provider,
          providerStatus: payload.status,
        },
      }
    );

    return { verification, alerts };
  }

  private mapStatus(status: KycCallbackPayload['status']): VerificationStatus {
    switch (status) {
      case 'approved':
        return VerificationStatus.VERIFIED;
      case 'pending':
        return VerificationStatus.PENDING;
      case 'rejected':
        return VerificationStatus.FLAGGED;
      default:
        throw new BadRequestException(`Unsupported KYC status: ${status}`);
    }
  }

  private deriveAlerts(status: VerificationStatus, payload: KycCallbackPayload): string[] {
    const alerts: string[] = [];
    const providerLabel = payload.provider.charAt(0).toUpperCase() + payload.provider.slice(1);
    if (status === VerificationStatus.FLAGGED) {
      alerts.push(`${providerLabel} rejected the applicant. Escalate for manual review.`);
    }
    if (
      payload.metadata &&
      'riskScore' in payload.metadata &&
      typeof payload.metadata.riskScore === 'number'
    ) {
      if ((payload.metadata.riskScore as number) >= 80) {
        alerts.push('High KYC risk score reported by provider.');
      }
    }
    return alerts;
  }
}
