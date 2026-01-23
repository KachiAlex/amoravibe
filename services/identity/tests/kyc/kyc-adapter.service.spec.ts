import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VerificationStatus } from '../../src/common/enums/verification-status.enum';
import { Gender } from '../../src/common/enums/gender.enum';
import { Orientation } from '../../src/common/enums/orientation.enum';
import { DiscoverySpace } from '../../src/common/enums/discovery-space.enum';
import { MatchPreference } from '../../src/common/enums/match-preference.enum';
import { VerificationIntent } from '../../src/common/enums/verification-intent.enum';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { UserService } from '../../src/modules/user/services/user.service';
import { VerificationService } from '../../src/modules/verification/services/verification.service';
import { KycAdapterService } from '../../src/modules/kyc/services/kyc-adapter.service';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
import { AuditService } from '../../src/modules/audit/services/audit.service';
import { KycProvider } from '../../src/modules/kyc/interfaces/kyc-provider.interface';
import { PrismaClientLike } from '../../src/prisma/prisma.types';

const buildUserPayload = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => ({
  legalName: 'Adapter Tester',
  displayName: 'adapter_test',
  dateOfBirth: '1992-05-15',
  email: `${Math.random().toString(36).slice(2)}@example.com`,
  password: 'AdapterPass123',
  gender: Gender.MAN,
  orientation: Orientation.STRAIGHT,
  orientationPreferences: [Orientation.STRAIGHT],
  discoverySpace: DiscoverySpace.STRAIGHT,
  matchPreferences: [MatchPreference.WOMEN],
  city: 'Nairobi',
  bio: 'Testing adapter flows',
  photos: ['data:image/png;base64,placeholder'],
  verificationIntent: VerificationIntent.VERIFY_NOW,
  ...overrides,
});

describe('KycAdapterService', () => {
  let prisma: InMemoryPrismaService;
  let prismaClient: PrismaClientLike;
  let userService: UserService;
  let auditService: AuditService;
  let verificationService: VerificationService;
  let provider: KycProvider;
  let adapter: KycAdapterService;

  beforeEach(() => {
    prisma = new InMemoryPrismaService();
    prismaClient = prisma as unknown as PrismaClientLike;
    userService = new UserService(prismaClient);
    auditService = new AuditService(prismaClient);
    verificationService = new VerificationService(prismaClient, userService, auditService);
    provider = {
      createVerification: vi.fn(),
      getUploadTarget: vi.fn(),
      parseWebhook: vi.fn(),
    } as unknown as KycProvider;
    adapter = new KycAdapterService(verificationService, provider);
  });

  it('persists provider references returned by the adapter', async () => {
    const user = await userService.create(buildUserPayload());
    const providerReference = 'mock-provider-ref';
    (provider.createVerification as ReturnType<typeof vi.fn>).mockResolvedValue({
      providerReference,
    });

    const verification = await adapter.initiate({
      userId: user.id,
      kycProvider: 'mock-provider',
      targetStatus: VerificationStatus.PENDING,
    });

    expect(provider.createVerification).toHaveBeenCalledWith({
      userId: user.id,
      verificationId: verification.id,
    });
    expect(verification.reference).toBe(providerReference);

    const stored = await verificationService.findById(verification.id);
    expect(stored?.reference).toBe(providerReference);
  });

  it('returns the verification unchanged when provider omits a reference', async () => {
    const user = await userService.create(buildUserPayload());
    (provider.createVerification as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const verification = await adapter.initiate({
      userId: user.id,
      kycProvider: 'mock-provider',
      targetStatus: VerificationStatus.PENDING,
    });

    expect(provider.createVerification).toHaveBeenCalledOnce();
    expect(verification.reference).toBeNull();
  });
});
