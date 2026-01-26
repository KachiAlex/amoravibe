import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OnboardingSubmissionDto } from '../dto/onboarding-submission.dto';
import { UserService } from '../../user/services/user.service';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';
import { VerificationIntent } from '../../../common/enums/verification-intent.enum';
import { AppConfigService } from '../../../config/config.service';
import { KycAdapterService } from '../../kyc/services/kyc-adapter.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';
import { OnboardingStatusDto, OnboardingStepDto } from '../dto/onboarding-status.dto';
import type { Prisma, User, Verification } from '../../../prisma/client';

interface StepDefinition extends Pick<OnboardingStepDto, 'id' | 'title' | 'description'> {}

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: 'identity',
    title: 'Identity proof',
    description: 'Scan government ID + liveness selfie',
  },
  {
    id: 'device',
    title: 'Device trust',
    description: 'Register trusted device + biometric fallback',
  },
  {
    id: 'profile',
    title: 'Discovery profile',
    description: 'Orientation, pronouns, and match intent',
  },
];

@Injectable()
export class OnboardingService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaClientLike,
    private readonly userService: UserService,
    private readonly kycAdapter: KycAdapterService,
    private readonly config: AppConfigService
  ) {}

  async submit(dto: OnboardingSubmissionDto) {
    const { legalLastName, ...userPayload } = dto;
    const legalName = legalLastName ? `${dto.legalName} ${legalLastName}`.trim() : dto.legalName;

    const user = await this.userService.create({
      ...userPayload,
      legalName,
    });

    const shouldVerifyNow = dto.verificationIntent === VerificationIntent.VERIFY_NOW;

    const verification = await this.kycAdapter.initiate({
      userId: user.id,
      kycProvider: this.config.kyc.provider,
      targetStatus: shouldVerifyNow ? VerificationStatus.PENDING : VerificationStatus.UNVERIFIED,
    });

    return {
      user,
      verification,
      nextRoute: `/dashboard?userId=${user.id}`,
    };
  }

  async getStatus(userId: string): Promise<OnboardingStatusDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const [latestVerification, deviceCount] = await Promise.all([
      this.prisma.verification.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deviceFingerprint.count({ where: { userId } }),
    ]);

    const completionMap: Record<string, boolean> = {
      identity: this.isIdentityComplete(user, latestVerification),
      device: deviceCount > 0,
      profile: this.isProfileComplete(user),
    };

    const steps: OnboardingStepDto[] = STEP_DEFINITIONS.map((definition) => ({
      ...definition,
      status: completionMap[definition.id] ? 'complete' : 'pending',
    }));

    const firstIncompleteIndex = steps.findIndex((step) => step.status !== 'complete');
    if (firstIncompleteIndex >= 0) {
      steps[firstIncompleteIndex] = { ...steps[firstIncompleteIndex], status: 'active' };
    }

    const completedCount = Object.values(completionMap).filter(Boolean).length;
    const progressPercent = Math.round((completedCount / steps.length) * 100);

    return {
      userId,
      progressPercent,
      steps,
    };
  }

  private isIdentityComplete(user: User, verification: Verification | null): boolean {
    if (user.isVerified) {
      return true;
    }

    return verification?.status === VerificationStatus.VERIFIED;
  }

  private isProfileComplete(user: User): boolean {
    const photos = this.extractPhotos(user.photos);
    const hasCity = Boolean(user.city);
    const hasBio = typeof user.bio === 'string' && user.bio.trim().length >= 20;
    const hasPhotos = photos.length >= 3;
    const hasPreferences = Array.isArray(user.matchPreferences) && user.matchPreferences.length > 0;

    return hasCity && hasBio && hasPhotos && hasPreferences;
  }

  private extractPhotos(photos: Prisma.JsonValue | null): string[] {
    if (!Array.isArray(photos)) {
      return [];
    }

    return photos.filter((photo): photo is string => typeof photo === 'string');
  }
}
