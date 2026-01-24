import { beforeEach, describe, expect, it } from 'vitest';
import { AnalyticsDashboardService } from '../../src/modules/analytics/services/analytics-dashboard.service';
import { InMemoryPrismaService } from '../utils/in-memory-prisma.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  AnalyticsPiiTier,
  Orientation,
  RiskSignalSeverity,
  RiskSignalChannel,
  ModerationSeverity,
  RiskSignalType,
  DiscoverySpace,
} from '../../src/prisma/client';

const buildDate = (iso: string) => new Date(iso);

describe('AnalyticsDashboardService', () => {
  let prisma: InMemoryPrismaService;
  let service: AnalyticsDashboardService;

  beforeEach(() => {
    prisma = new InMemoryPrismaService();
    service = new AnalyticsDashboardService(prisma as unknown as PrismaService);
  });

  it('throws when window is invalid', async () => {
    await expect(() =>
      service.getDashboard({
        startDate: '2024-01-05T00:00:00.000Z',
        endDate: '2024-01-01T00:00:00.000Z',
      })
    ).rejects.toThrow('Invalid date window supplied');
  });

  it('returns empty aggregates when no analytics data exists', async () => {
    const response = await service.getDashboard({
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-07T23:59:59.999Z',
      maxPiiTier: AnalyticsPiiTier.aggregate,
    });

    expect(response.trustHealth.snapshotCount).toBe(0);
    expect(response.trustSignals.total).toBe(0);
    expect(response.moderation.total).toBe(0);
    expect(response.trustSignals.trend).toEqual([]);
    expect(response.moderation.trend).toEqual([]);
  });

  it('filters by orientation and PII tier while building aggregates', async () => {
    const windowStart = buildDate('2024-01-01T00:00:00Z');
    const windowEnd = buildDate('2024-01-07T00:00:00Z');

    // snapshots
    await prisma.analyticsUserSnapshot.upsert({
      where: {
        userId_snapshotDate: { userId: 'user-verified', snapshotDate: windowStart },
      },
      update: {},
      create: {
        userId: 'user-verified',
        snapshotDate: windowStart,
        hashedEmail: 'hash-email-1',
        hashedPhone: 'hash-phone-1',
        orientation: Orientation.heterosexual,
        discoverySpace: DiscoverySpace.straight,
        trustScore: 80,
        isVerified: true,
        piiTier: AnalyticsPiiTier.hashed,
        metadata: null,
        createdAt: windowStart,
      },
    });

    await prisma.analyticsUserSnapshot.upsert({
      where: {
        userId_snapshotDate: { userId: 'user-unverified', snapshotDate: windowStart },
      },
      update: {},
      create: {
        userId: 'user-unverified',
        snapshotDate: windowStart,
        hashedEmail: 'hash-email-2',
        hashedPhone: 'hash-phone-2',
        orientation: Orientation.gay,
        discoverySpace: DiscoverySpace.lgbtq,
        trustScore: 45,
        isVerified: false,
        piiTier: AnalyticsPiiTier.direct,
        metadata: null,
        createdAt: windowStart,
      },
    });

    // trust signals
    await prisma.analyticsTrustSignalFact.upsert({
      where: { signalId: 'signal-hashed' },
      update: {},
      create: {
        signalId: 'signal-hashed',
        userId: 'user-verified',
        hashedUserId: 'hash-user',
        signalType: RiskSignalType.device_fingerprint,
        channel: RiskSignalChannel.device,
        severity: RiskSignalSeverity.high,
        score: 0.8,
        piiTier: AnalyticsPiiTier.hashed,
        occurredAt: buildDate('2024-01-02T22:00:00Z'),
        createdAt: buildDate('2024-01-02T22:00:00Z'),
      },
    });

    await prisma.analyticsTrustSignalFact.upsert({
      where: { signalId: 'signal-direct' },
      update: {},
      create: {
        signalId: 'signal-direct',
        userId: 'user-unverified',
        hashedUserId: 'hash-user-2',
        signalType: RiskSignalType.behavior_anomaly,
        channel: RiskSignalChannel.behavior,
        severity: RiskSignalSeverity.medium,
        score: 0.2,
        piiTier: AnalyticsPiiTier.direct,
        occurredAt: buildDate('2024-01-03T10:00:00Z'),
        createdAt: buildDate('2024-01-03T10:00:00Z'),
      },
    });

    // moderation facts
    await prisma.analyticsModerationFact.upsert({
      where: { moderationEventId: 'mod-hashed' },
      update: {},
      create: {
        moderationEventId: 'mod-hashed',
        userId: 'user-verified',
        hashedUserId: 'hash-user',
        severity: ModerationSeverity.warning,
        message: 'warn event',
        piiTier: AnalyticsPiiTier.hashed,
        occurredAt: buildDate('2024-01-04T23:00:00Z'),
        createdAt: buildDate('2024-01-04T23:00:00Z'),
      },
    });

    await prisma.analyticsModerationFact.upsert({
      where: { moderationEventId: 'mod-direct' },
      update: {},
      create: {
        moderationEventId: 'mod-direct',
        userId: 'user-unverified',
        hashedUserId: 'hash-user-2',
        severity: ModerationSeverity.critical,
        message: 'critical event',
        piiTier: AnalyticsPiiTier.direct,
        occurredAt: buildDate('2024-01-05T01:00:00Z'),
        createdAt: buildDate('2024-01-05T01:00:00Z'),
      },
    });

    const response = await service.getDashboard({
      startDate: windowStart.toISOString(),
      endDate: windowEnd.toISOString(),
      maxPiiTier: AnalyticsPiiTier.hashed,
      orientation: Orientation.heterosexual,
      timezoneOffsetMinutes: 120,
    });

    expect(response.trustHealth.snapshotCount).toBe(1);
    expect(response.trustHealth.verifiedRate).toBe(100);
    expect(response.trustHealth.averageTrustScore).toBe(80);
    expect(response.trustSignals.total).toBe(1);
    expect(response.moderation.total).toBe(1);

    expect(response.trustSignals.trend).toEqual([{ date: '2024-01-03', total: 1, critical: 1 }]);
    expect(response.moderation.trend).toEqual([{ date: '2024-01-05', total: 1 }]);
  });
});
