import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { Prisma } from '../../../prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppConfigService } from '../../../config/config.service';
import {
  AnalyticsPiiTier,
  ModerationSeverity,
  RiskSignalSeverity,
  RiskSignalType,
  RiskSignalChannel,
  User,
  RiskSignal,
  ModerationEvent,
} from '../../../prisma/client';

const USER_SNAPSHOT_JOB = 'analytics-user-snapshots';
const TRUST_SIGNAL_JOB = 'analytics-trust-signals';
const MODERATION_JOB = 'analytics-moderation-events';

@Injectable()
export class AnalyticsIngestionService {
  private readonly logger = new Logger(AnalyticsIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService
  ) {}

  async runAllPipelines() {
    await this.snapshotUsers();
    await this.ingestTrustSignals();
    await this.ingestModerationEvents();
  }

  async snapshotUsers(): Promise<number> {
    const windowMinutes = this.config.analytics.snapshotWindowMinutes;
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    const users = await this.prisma.user.findMany({
      where: { updatedAt: { gte: windowStart } },
    });

    if (users.length === 0) {
      await this.touchRun(USER_SNAPSHOT_JOB);
      return 0;
    }

    const snapshotDate = this.alignSnapshotDate(windowMinutes);
    for (const user of users) {
      await this.prisma.analyticsUserSnapshot.upsert({
        where: {
          userId_snapshotDate: {
            userId: user.id,
            snapshotDate,
          },
        },
        update: this.buildUserSnapshotPayload(user, snapshotDate),
        create: {
          userId: user.id,
          snapshotDate,
          ...this.buildUserSnapshotPayload(user, snapshotDate),
        },
      });
    }

    await this.touchRun(USER_SNAPSHOT_JOB);
    this.logger.log(`Captured ${users.length} user snapshots for analytics window`);
    return users.length;
  }

  async ingestTrustSignals(): Promise<number> {
    const since = await this.getLastRun(TRUST_SIGNAL_JOB);
    const signals = await this.prisma.riskSignal.findMany({
      where: since ? { createdAt: { gt: since } } : undefined,
      orderBy: { createdAt: 'asc' },
    });

    if (signals.length === 0) {
      await this.touchRun(TRUST_SIGNAL_JOB);
      return 0;
    }

    for (const signal of signals) {
      await this.prisma.analyticsTrustSignalFact.upsert({
        where: { signalId: signal.id },
        update: this.buildTrustSignalPayload(signal),
        create: {
          signalId: signal.id,
          userId: signal.userId ?? null,
          hashedUserId: this.hashValue(signal.userId),
          signalType: signal.type as RiskSignalType,
          channel: signal.channel as RiskSignalChannel,
          severity: signal.severity as RiskSignalSeverity,
          score: signal.score,
          piiTier: signal.userId ? AnalyticsPiiTier.direct : AnalyticsPiiTier.aggregate,
          occurredAt: signal.createdAt,
        },
      });
    }

    await this.touchRun(TRUST_SIGNAL_JOB);
    this.logger.log(`Ingested ${signals.length} trust signals into analytics facts`);
    return signals.length;
  }

  async ingestModerationEvents(): Promise<number> {
    const since = await this.getLastRun(MODERATION_JOB);
    const events = await this.prisma.moderationEvent.findMany({
      where: since ? { createdAt: { gt: since } } : undefined,
      orderBy: { createdAt: 'asc' },
    });

    if (events.length === 0) {
      await this.touchRun(MODERATION_JOB);
      return 0;
    }

    for (const event of events) {
      await this.prisma.analyticsModerationFact.upsert({
        where: { moderationEventId: event.id },
        update: this.buildModerationPayload(event),
        create: {
          moderationEventId: event.id,
          userId: event.userId ?? null,
          hashedUserId: this.hashValue(event.userId),
          severity: event.severity as ModerationSeverity,
          message: event.message,
          piiTier: event.userId ? AnalyticsPiiTier.direct : AnalyticsPiiTier.aggregate,
          occurredAt: event.createdAt,
        },
      });
    }

    await this.touchRun(MODERATION_JOB);
    this.logger.log(`Ingested ${events.length} moderation events into analytics facts`);
    return events.length;
  }

  private buildUserSnapshotPayload(user: User, snapshotDate: Date) {
    return {
      hashedEmail: this.hashValue(user.email ?? undefined),
      hashedPhone: this.hashValue(user.phone ?? undefined),
      orientation: user.orientation,
      discoverySpace: user.discoverySpace,
      trustScore: user.trustScore,
      isVerified: user.isVerified,
      piiTier: AnalyticsPiiTier.hashed,
      metadata: {
        matchPreferences: user.matchPreferences,
        orientationPreferences: user.orientationPreferences,
        visibility: user.visibility,
      } as Prisma.InputJsonValue,
      createdAt: snapshotDate,
    };
  }

  private buildTrustSignalPayload(signal: RiskSignal) {
    return {
      userId: signal.userId ?? null,
      hashedUserId: this.hashValue(signal.userId),
      signalType: signal.type as RiskSignalType,
      channel: signal.channel as RiskSignalChannel,
      severity: signal.severity as RiskSignalSeverity,
      score: signal.score,
      piiTier: signal.userId ? AnalyticsPiiTier.direct : AnalyticsPiiTier.aggregate,
      occurredAt: signal.createdAt,
    };
  }

  private buildModerationPayload(event: ModerationEvent) {
    return {
      userId: event.userId ?? null,
      hashedUserId: this.hashValue(event.userId),
      severity: event.severity as ModerationSeverity,
      message: event.message,
      piiTier: event.userId ? AnalyticsPiiTier.direct : AnalyticsPiiTier.aggregate,
      occurredAt: event.createdAt,
    };
  }

  private async getLastRun(jobName: string): Promise<Date | null> {
    const run = await this.prisma.analyticsIngestionRun.findUnique({ where: { jobName } });
    return run?.lastRunAt ?? null;
  }

  private async touchRun(jobName: string, checkpoint?: Record<string, unknown>) {
    const now = new Date();
    await this.prisma.analyticsIngestionRun.upsert({
      where: { jobName },
      update: {
        lastRunAt: now,
        checkpoint: checkpoint ? (checkpoint as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
      create: {
        jobName,
        lastRunAt: now,
        checkpoint: checkpoint ? (checkpoint as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  private alignSnapshotDate(windowMinutes: number): Date {
    const windowMs = windowMinutes * 60 * 1000;
    const aligned = Math.floor(Date.now() / windowMs) * windowMs;
    return new Date(aligned);
  }

  private hashValue(value?: string | null): string | null {
    if (!value) {
      return null;
    }
    return createHash('sha256')
      .update(this.config.analytics.piiHashSalt)
      .update(value)
      .digest('hex');
  }
}
