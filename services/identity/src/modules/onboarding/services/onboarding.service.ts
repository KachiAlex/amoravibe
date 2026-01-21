import { Injectable } from '@nestjs/common';
import { OnboardingSubmissionDto } from '../dto/onboarding-submission.dto';
import { UserService } from '../../user/services/user.service';
import { VerificationService } from '../../verification/services/verification.service';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';
import { VerificationIntent } from '../../../common/enums/verification-intent.enum';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly userService: UserService,
    private readonly verificationService: VerificationService
  ) {}

  async submit(dto: OnboardingSubmissionDto) {
    const { legalLastName, ...userPayload } = dto;
    const legalName = legalLastName ? `${dto.legalName} ${legalLastName}`.trim() : dto.legalName;

    const user = await this.userService.create({
      ...userPayload,
      legalName,
    });

    const shouldVerifyNow = dto.verificationIntent === VerificationIntent.VERIFY_NOW;

    const verification = await this.verificationService.initiate({
      userId: user.id,
      kycProvider: 'manual_review',
      targetStatus: shouldVerifyNow ? VerificationStatus.PENDING : VerificationStatus.UNVERIFIED,
    });

    return {
      user,
      verification,
      nextRoute: `/dashboard?userId=${user.id}`,
    };
  }
}
