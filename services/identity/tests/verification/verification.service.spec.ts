import { beforeEach, describe, expect, it } from 'vitest';
import { VerificationService } from '../../src/modules/verification/services/verification.service';
import { VerificationStatus } from '../../src/common/enums/verification-status.enum';
import { UserService } from '../../src/modules/user/services/user.service';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
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
  let userService: UserService;
  let verificationService: VerificationService;

  beforeEach(() => {
    prisma = new InMemoryPrismaService();
    userService = new UserService(prisma);
    verificationService = new VerificationService(prisma, userService);
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
