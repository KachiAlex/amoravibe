import { beforeEach, describe, expect, it } from 'vitest';
import { UserService } from '../../src/modules/user/services/user.service';
import { VerificationService } from '../../src/modules/verification/services/verification.service';
import { KycService } from '../../src/modules/kyc/services/kyc.service';
import { VerificationStatus } from '../../src/common/enums/verification-status.enum';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
import { Gender } from '../../src/common/enums/gender.enum';
import { Orientation } from '../../src/common/enums/orientation.enum';

const createUserPayload = () => ({
  legalName: 'Test User',
  displayName: 'tester',
  email: `${Math.random().toString(36).slice(2)}@example.com`,
  gender: Gender.MALE,
  orientation: Orientation.HETEROSEXUAL,
});

describe('KycService', () => {
  let prisma: InMemoryPrismaService;
  let userService: UserService;
  let verificationService: VerificationService;
  let kycService: KycService;
  let userId: string;
  let verificationId: string;

  beforeEach(async () => {
    prisma = new InMemoryPrismaService();
    userService = new UserService(prisma);
    verificationService = new VerificationService(prisma, userService);
    kycService = new KycService(verificationService);

    const user = await userService.create(createUserPayload());
    userId = user.id;

    const verification = await verificationService.initiate({
      userId,
      kycProvider: 'persona',
      targetStatus: VerificationStatus.PENDING,
    });
    verificationId = verification.id;
  });

  it('approving callback verifies user and surfaces no alerts', async () => {
    const result = await kycService.handleCallback({
      verificationId,
      provider: 'persona',
      status: 'approved',
      reference: 'kyc-ref-1',
      metadata: { riskScore: 10 },
    });

    expect(result.alerts).toHaveLength(0);
    expect(result.verification?.id).toBe(verificationId);
    expect(result.verification?.status).toBe(VerificationStatus.VERIFIED);

    const refreshedUser = await userService.findById(userId);
    expect(refreshedUser?.isVerified).toBe(true);
  });

  it('rejected callback flags verification and emits alerts', async () => {
    const result = await kycService.handleCallback({
      verificationId,
      provider: 'persona',
      status: 'rejected',
      metadata: { riskScore: 90 },
    });

    expect(result.alerts).toContain('Persona rejected the applicant. Escalate for manual review.');
    expect(result.alerts).toContain('High KYC risk score reported by provider.');
    expect(result.verification?.status).toBe(VerificationStatus.FLAGGED);

    const refreshedUser = await userService.findById(userId);
    expect(refreshedUser?.isVerified).toBe(false);
  });
});
