import { beforeEach, describe, expect, it } from 'vitest';
import { UserService } from '../../src/modules/user/services/user.service';
import { VerificationService } from '../../src/modules/verification/services/verification.service';
import { KycService } from '../../src/modules/kyc/services/kyc.service';
import { VerificationStatus } from '../../src/common/enums/verification-status.enum';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
import { AuditService } from '../../src/modules/audit/services/audit.service';
import { AppConfigService } from '../../src/config/config.service';
import { PrismaClientLike } from '../../src/prisma/prisma.types';
import { Gender } from '../../src/common/enums/gender.enum';
import { Orientation } from '../../src/common/enums/orientation.enum';
import { DiscoverySpace } from '../../src/common/enums/discovery-space.enum';
import { MatchPreference } from '../../src/common/enums/match-preference.enum';
import { VerificationIntent } from '../../src/common/enums/verification-intent.enum';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';

const buildUserPayload = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => ({
  legalName: 'Test User',
  displayName: 'tester',
  dateOfBirth: '1990-01-01',
  email: `${Math.random().toString(36).slice(2)}@example.com`,
  password: 'StrongPass123',
  gender: Gender.MAN,
  orientation: Orientation.STRAIGHT,
  orientationPreferences: [Orientation.STRAIGHT],
  discoverySpace: DiscoverySpace.STRAIGHT,
  matchPreferences: [MatchPreference.WOMEN],
  city: 'Lagos',
  bio: 'Here for intentional matches',
  photos: ['data:image/png;base64,placeholder'],
  verificationIntent: VerificationIntent.VERIFY_NOW,
  ...overrides,
});

describe('KycService', () => {
  let prisma: InMemoryPrismaService;
  let prismaClient: PrismaClientLike;
  let userService: UserService;
  let verificationService: VerificationService;
  let kycService: KycService;
  let auditService: AuditService;
  let userId: string;
  let verificationId: string;

  const fakeConfig = { audit: { retentionDays: 1 } } as AppConfigService;

  beforeEach(async () => {
    prisma = new InMemoryPrismaService();
    prismaClient = prisma as unknown as PrismaClientLike;
    userService = new UserService(prismaClient);
    auditService = new AuditService(prismaClient, fakeConfig);
    verificationService = new VerificationService(prismaClient, userService, auditService);
    kycService = new KycService(verificationService);

    const user = await userService.create(buildUserPayload());
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
