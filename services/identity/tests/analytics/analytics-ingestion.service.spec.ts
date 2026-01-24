import { beforeEach, describe, expect, it } from 'vitest';
import { createHash } from 'crypto';
import { AnalyticsIngestionService } from '../../src/modules/analytics/services/analytics-ingestion.service';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AppConfigService } from '../../src/config/config.service';
import { Gender } from '../../src/common/enums/gender.enum';
import { Orientation } from '../../src/common/enums/orientation.enum';
import { DiscoverySpace } from '../../src/common/enums/discovery-space.enum';
import { MatchPreference } from '../../src/common/enums/match-preference.enum';
import { VerificationIntent } from '../../src/common/enums/verification-intent.enum';
import { VisibilityStatus } from '../../src/common/enums/visibility-status.enum';
import {
  RiskSignalChannel,
  RiskSignalSeverity,
  RiskSignalType,
  ModerationSeverity,
} from '../../src/prisma/client';

const buildConfig = (): AppConfigService =>
  ({
    analytics: {
      warehouseUrl: 'postgresql://localhost:5432/analytics_test',
      piiHashSalt: 'spec-salt',
      snapshotWindowMinutes: 120,
    },
  }) as AppConfigService;

const hash = (salt: string, value: string) =>
  createHash('sha256').update(salt).update(value).digest('hex');

const createUser = async (
  prisma: InMemoryPrismaService,
  overrides: Partial<Record<string, unknown>> = {}
) => {
  return prisma.user.create({
    data: {
      legalName: 'Spec User',
      displayName: 'spec_user',
      dateOfBirth: new Date('1990-01-01'),
      email: 'spec@example.com',
      phone: '+1230000000',
      passwordHash: 'hashed-password',
      gender: Gender.MAN,
      orientation: Orientation.STRAIGHT,
      orientationPreferences: [Orientation.STRAIGHT],
      discoverySpace: DiscoverySpace.STRAIGHT,
      matchPreferences: [MatchPreference.WOMEN],
      city: 'Lagos',
      bio: 'Testing analytics',
      photos: null,
      verificationIntent: VerificationIntent.VERIFY_NOW,
      trustScore: 55,
      visibility: VisibilityStatus.FULL,
      isVerified: false,
      ...overrides,
    },
  });
};

describe('AnalyticsIngestionService', () => {
  let prisma: InMemoryPrismaService;
  let service: AnalyticsIngestionService;
  let config: AppConfigService;

  beforeEach(() => {
    prisma = new InMemoryPrismaService();
    config = buildConfig();
    service = new AnalyticsIngestionService(prisma as unknown as PrismaService, config);
  });

  it('snapshots recently updated users with hashed identifiers', async () => {
    const user = await createUser(prisma);

    const processed = await service.snapshotUsers();
    expect(processed).toBe(1);

    const snapshots = await prisma.analyticsUserSnapshot.findMany();
    expect(snapshots).toHaveLength(1);
    const snapshot = snapshots[0];
    expect(snapshot.userId).toBe(user.id);
    expect(snapshot.hashedEmail).toBe(hash(config.analytics.piiHashSalt, user.email!));
    expect(snapshot.hashedPhone).toBe(hash(config.analytics.piiHashSalt, user.phone!));
    expect(snapshot.metadata).toMatchObject({
      matchPreferences: user.matchPreferences,
      orientationPreferences: user.orientationPreferences,
      visibility: user.visibility,
    });

    const runs = await prisma.analyticsIngestionRun.findMany();
    const snapshotRun = runs.find((run) => run.jobName === 'analytics-user-snapshots');
    expect(snapshotRun?.lastRunAt).toBeInstanceOf(Date);
  });

  it('ingests trust signals incrementally and hashes user ids', async () => {
    const user = await createUser(prisma, { email: 'trust@example.com' });

    await prisma.riskSignal.create({
      data: {
        userId: user.id,
        relatedUserId: null,
        deviceFingerprintId: null,
        type: RiskSignalType.device_fingerprint,
        channel: RiskSignalChannel.device,
        severity: RiskSignalSeverity.medium,
        metadata: { source: 'spec' },
        features: { foo: 'bar' },
        score: 0.45,
      },
    });

    const firstProcessed = await service.ingestTrustSignals();
    expect(firstProcessed).toBe(1);
    const facts = await prisma.analyticsTrustSignalFact.findMany();
    expect(facts).toHaveLength(1);
    expect(facts[0]).toMatchObject({
      userId: user.id,
      hashedUserId: hash(config.analytics.piiHashSalt, user.id),
      signalType: RiskSignalType.device_fingerprint,
    });

    const secondProcessed = await service.ingestTrustSignals();
    expect(secondProcessed).toBe(0);
  });

  it('ingests moderation events and records direct PII tier when user present', async () => {
    const user = await createUser(prisma, { email: 'mod@example.com' });

    await prisma.moderationEvent.create({
      data: {
        userId: user.id,
        deviceFingerprintId: null,
        severity: ModerationSeverity.high,
        message: 'Repeated spam links',
        metadata: null,
      },
    });

    const processed = await service.ingestModerationEvents();
    expect(processed).toBe(1);

    const facts = await prisma.analyticsModerationFact.findMany();
    expect(facts).toHaveLength(1);
    expect(facts[0]).toMatchObject({
      userId: user.id,
      hashedUserId: hash(config.analytics.piiHashSalt, user.id),
      piiTier: 'direct',
    });

    const run = (await prisma.analyticsIngestionRun.findMany()).find(
      (entry) => entry.jobName === 'analytics-moderation-events'
    );
    expect(run?.lastRunAt).toBeInstanceOf(Date);
  });
});
