import { beforeEach, describe, expect, it } from 'vitest';
import { VerificationService } from '../../src/modules/verification/services/verification.service';
import { VerificationStatus } from '../../src/common/enums/verification-status.enum';
import { UserService } from '../../src/modules/user/services/user.service';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
import { Gender } from '../../src/common/enums/gender.enum';
import { Orientation } from '../../src/common/enums/orientation.enum';

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
    const user = await userService.create({
      legalName: 'Test User',
      displayName: 'tester',
      email: 'test@example.com',
      gender: Gender.MALE,
      orientation: Orientation.HETEROSEXUAL,
    });

    const record = await verificationService.initiate({
      userId: user.id,
      kycProvider: 'manual_review',
      targetStatus: VerificationStatus.PENDING,
    });

    expect(record.userId).toBe(user.id);
    expect(record.status).toBe(VerificationStatus.PENDING);
  });

  it('completes a verification and marks user verified', async () => {
    const user = await userService.create({
      legalName: 'Another User',
      displayName: 'another',
      email: 'another@example.com',
      gender: Gender.FEMALE,
      orientation: Orientation.HETEROSEXUAL,
    });

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
