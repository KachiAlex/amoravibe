import { beforeEach, describe, expect, it } from 'vitest';
import { VerificationService } from '../../src/modules/verification/services/verification.service';
import { VerificationStatus } from '../../src/common/enums/verification-status.enum';
import { UserService } from '../../src/modules/user/services/user.service';
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

describe('VerificationService', () => {
  let prisma: InMemoryPrismaService;
  let prismaClient: PrismaClientLike;
  let userService: UserService;
  let verificationService: VerificationService;
  let auditService: AuditService;

  const fakeConfig = { audit: { retentionDays: 1 } } as AppConfigService;

  beforeEach(() => {
    prisma = new InMemoryPrismaService();
    prismaClient = prisma as unknown as PrismaClientLike;
    userService = new UserService(prismaClient);
    auditService = new AuditService(prismaClient, fakeConfig);
    verificationService = new VerificationService(prismaClient, userService, auditService);
  });

  it('initiates a verification record', async () => {
    const user = await userService.create(buildUserPayload());

    const record = await verificationService.initiate({
      userId: user.id,
      kycProvider: 'manual_review',
      targetStatus: VerificationStatus.PENDING,
    });

    expect(record.userId).toBe(user.id);
    expect(record.status).toBe(VerificationStatus.PENDING);
  });

  it('completes a verification and marks user verified', async () => {
    const user = await userService.create(
      buildUserPayload({
        legalName: 'Another User',
        displayName: 'another',
        gender: Gender.WOMAN,
      })
    );

    const record = await verificationService.initiate({
      userId: user.id,
      kycProvider: 'manual_review',
      targetStatus: VerificationStatus.PENDING,
    });

    const completed = await verificationService.complete(record.id);
    const updatedUser = await userService.findById(user.id);

    expect(completed.status).toBe(VerificationStatus.VERIFIED);
    expect(updatedUser?.isVerified).toBe(true);
  });
});
