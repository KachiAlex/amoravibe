import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  AnalyticsPiiTier,
  AnalyticsUserSnapshot,
  AnalyticsTrustSignalFact,
  AnalyticsModerationFact,
  RiskSignalSeverity,
  RiskSignalChannel,
  ModerationSeverity,
  Orientation,
} from '../../../prisma/client';
import {
  AnalyticsDashboardQueryDto,
  AnalyticsDashboardResponse,
  AnalyticsLeadershipReport,
  DashboardTimeseriesPoint,
  TrustHealthSummary,
  TrustSignalBreakdown,
  ModerationBreakdown,
} from '../dto/analytics-dashboard.dto';
import {
  TrustPreviewResponseDto,
  TrustPreviewRiskHealth,
  TrustPreviewJourneyStepDto,
  TrustPreviewHighlightDto,
} from '../dto/trust-preview.dto';
import { AppConfigService } from '../../../config/config.service';

const PII_TIER_ORDER: AnalyticsPiiTier[] = [
  AnalyticsPiiTier.aggregate,
  AnalyticsPiiTier.hashed,
  AnalyticsPiiTier.direct,
];

const TRUST_PREVIEW_WINDOW_DAYS = 7;
const TRUST_PREVIEW_EXPORT_SLA_HOURS = 48;

const TRUST_PREVIEW_JOURNEY: TrustPreviewJourneyStepDto[] = [
  {
    id: 'orientation',
    title: 'Orientation',
    description: 'Preference mapping, discovery space selection, and risk disclosures.',
    tag: 'Profile',
  },
  {
    id: 'verification',
    title: 'Verification',
    description: 'Government ID upload, selfie match, and biometric opt-in.',
    tag: 'Required',
  },
  {
    id: 'device_trust',
    title: 'Device trust',
    description: 'Register trusted devices, configure biometrics, and review auth history.',
    tag: 'Security',
  },
  {
    id: 'trust_center',
    title: 'Trust center',
    description: 'View moderation decisions, request exports, and monitor risk health.',
    tag: 'Transparency',
  },
];

const TRUST_PREVIEW_HIGHLIGHTS: TrustPreviewHighlightDto[] = [
  {
    title: 'Realtime verification',
    body: 'Persona-backed flow unlocks messaging within minutes with selfie fallback.',
    badge: 'Phase 5',
  },
  {
    title: 'Transparent risk signals',
    body: 'Members can inspect risk drivers pulled from analytics dashboards.',
    badge: 'Trust ML',
  },
  {
    title: 'Privacy tooling',
    body: 'Data export + delete requests wire into audit service SLAs (<48h).',
    badge: 'Compliance',
  },
];

@Injectable()
export class AnalyticsDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService
  ) {}

  async getDashboard(dto: AnalyticsDashboardQueryDto): Promise<AnalyticsDashboardResponse> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      throw new BadRequestException('Invalid date window supplied');
    }

    const windowTiers = this.allowedTiers(dto.maxPiiTier ?? AnalyticsPiiTier.aggregate);
    const timezoneOffset = dto.timezoneOffsetMinutes ?? 0;

    const [snapshots, trustSignals, moderationFacts] = await Promise.all([
      this.prisma.analyticsUserSnapshot.findMany({
        where: {
          snapshotDate: { gte: start, lte: end },
          piiTier: { in: windowTiers },
          ...(dto.orientation ? { orientation: dto.orientation } : {}),
        },
      }),
      this.prisma.analyticsTrustSignalFact.findMany({
        where: {
          occurredAt: { gte: start, lte: end },
          piiTier: { in: windowTiers },
        },
      }),
      this.prisma.analyticsModerationFact.findMany({
        where: {
          occurredAt: { gte: start, lte: end },
          piiTier: { in: windowTiers },
        },
      }),
    ]);

    const trustHealth = this.buildTrustHealthSummary(snapshots);
    const signals = this.buildTrustSignalBreakdown(trustSignals, timezoneOffset);
    const moderation = this.buildModerationBreakdown(moderationFacts, timezoneOffset);

    return {
      window: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        maxPiiTier: dto.maxPiiTier ?? AnalyticsPiiTier.aggregate,
      },
      trustHealth,
      trustSignals: signals,
      moderation,
    };
  }

  mapToLeadershipReport(response: AnalyticsDashboardResponse): AnalyticsLeadershipReport {
    const highSeverityCount = response.trustSignals.bySeverity.find(
      (entry) => entry.severity === RiskSignalSeverity.high
    )?.count;
    const criticalModerationCount = response.moderation.bySeverity.find(
      (entry) => entry.severity === ModerationSeverity.critical
    )?.count;
    return {
      window: {
        startDate: response.window.startDate,
        endDate: response.window.endDate,
      },
      trustHealth: {
        snapshotCount: response.trustHealth.snapshotCount,
        verifiedRate: response.trustHealth.verifiedRate,
        averageTrustScore: response.trustHealth.averageTrustScore,
      },
      trustSignals: {
        total: response.trustSignals.total,
        highSeverityPercentage: response.trustSignals.total
          ? Number((((highSeverityCount ?? 0) / response.trustSignals.total) * 100).toFixed(2))
          : 0,
      },
      moderation: {
        total: response.moderation.total,
        criticalPercentage: response.moderation.total
          ? Number((((criticalModerationCount ?? 0) / response.moderation.total) * 100).toFixed(2))
          : 0,
      },
    };
  }

  async getTrustPreview(): Promise<TrustPreviewResponseDto> {
    const windowEnd = new Date();
    const windowStart = new Date(
      windowEnd.getTime() - TRUST_PREVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );

    const [snapshots, trustSignals] = await Promise.all([
      this.prisma.analyticsUserSnapshot.findMany({
        where: { snapshotDate: { gte: windowStart, lte: windowEnd } },
        take: 500,
      }),
      this.prisma.analyticsTrustSignalFact.findMany({
        where: { occurredAt: { gte: windowStart, lte: windowEnd } },
        take: 500,
      }),
    ]);

    const verificationPassRate = snapshots.length
      ? Number(
          (
            (snapshots.filter((snapshot) => snapshot.isVerified).length / snapshots.length) *
            100
          ).toFixed(1)
        )
      : 0;

    const averageTrustScore = snapshots.length
      ? snapshots.reduce((sum, snapshot) => sum + snapshot.trustScore, 0) / snapshots.length
      : 0;

    const highSeverityCount = trustSignals.filter(
      (fact) => fact.severity === RiskSignalSeverity.high
    ).length;
    const riskHealth = this.resolveRiskHealth(
      averageTrustScore,
      trustSignals.length ? highSeverityCount / trustSignals.length : 0
    );

    const monthLabel = windowEnd.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    return {
      snapshotLabel: `${this.config.appName} · ${monthLabel}`,
      stats: {
        verificationPassRate: Number(verificationPassRate.toFixed(0)),
        riskHealth,
        exportSlaHours: TRUST_PREVIEW_EXPORT_SLA_HOURS,
      },
      journey: TRUST_PREVIEW_JOURNEY,
      highlights: TRUST_PREVIEW_HIGHLIGHTS,
    };
  }

  private allowedTiers(max: AnalyticsPiiTier): AnalyticsPiiTier[] {
    const index = PII_TIER_ORDER.indexOf(max);
    const sliceIndex = index === -1 ? 0 : index;
    return PII_TIER_ORDER.slice(0, sliceIndex + 1);
  }

  private buildTrustHealthSummary(snapshots: AnalyticsUserSnapshot[]): TrustHealthSummary {
    if (snapshots.length === 0) {
      return {
        snapshotCount: 0,
        verifiedRate: 0,
        averageTrustScore: 0,
        orientationBreakdown: [],
      };
    }

    const snapshotCount = snapshots.length;
    const verifiedCount = snapshots.filter((s) => s.isVerified).length;
    const averageTrustScore = Math.round(
      snapshots.reduce((sum, snapshot) => sum + snapshot.trustScore, 0) / snapshotCount
    );

    const orientationCounts = snapshots.reduce<Record<Orientation, number>>(
      (acc, snapshot) => {
        acc[snapshot.orientation] = (acc[snapshot.orientation] ?? 0) + 1;
        return acc;
      },
      {} as Record<Orientation, number>
    );

    const orientationBreakdown = Object.entries(orientationCounts).map(([orientation, count]) => ({
      orientation: orientation as Orientation,
      percentage: Number(((count / snapshotCount) * 100).toFixed(2)),
    }));

    return {
      snapshotCount,
      verifiedRate: Number(((verifiedCount / snapshotCount) * 100).toFixed(2)),
      averageTrustScore,
      orientationBreakdown,
    };
  }

  private buildTrustSignalBreakdown(
    facts: AnalyticsTrustSignalFact[],
    timezoneOffset: number
  ): TrustSignalBreakdown {
    const total = facts.length;
    const bySeverity = this.countRiskSignalSeverity(facts);
    const byChannel = this.countRiskSignalChannel(facts);
    const trend = this.buildTrustTimeseries(facts, timezoneOffset);

    return { total, bySeverity, byChannel, trend };
  }

  private buildModerationBreakdown(
    facts: AnalyticsModerationFact[],
    timezoneOffset: number
  ): ModerationBreakdown {
    const total = facts.length;
    const bySeverity = this.countModerationSeverity(facts);
    const trend = this.buildModerationTimeseries(facts, timezoneOffset);

    return { total, bySeverity, trend };
  }

  private countRiskSignalSeverity(
    records: AnalyticsTrustSignalFact[]
  ): { severity: RiskSignalSeverity; count: number }[] {
    const counts = Object.values(RiskSignalSeverity).reduce<Record<RiskSignalSeverity, number>>(
      (acc, severity) => ({ ...acc, [severity]: 0 }),
      {} as Record<RiskSignalSeverity, number>
    );
    records.forEach((record) => {
      counts[record.severity] = (counts[record.severity] ?? 0) + 1;
    });
    return Object.entries(counts).map(([severity, count]) => ({
      severity: severity as RiskSignalSeverity,
      count,
    }));
  }

  private countRiskSignalChannel(
    records: AnalyticsTrustSignalFact[]
  ): { channel: RiskSignalChannel; count: number }[] {
    const counts = Object.values(RiskSignalChannel).reduce<Record<RiskSignalChannel, number>>(
      (acc, channel) => ({ ...acc, [channel]: 0 }),
      {} as Record<RiskSignalChannel, number>
    );
    records.forEach((record) => {
      counts[record.channel] = (counts[record.channel] ?? 0) + 1;
    });
    return Object.entries(counts).map(([channel, count]) => ({
      channel: channel as RiskSignalChannel,
      count,
    }));
  }

  private countModerationSeverity(
    records: AnalyticsModerationFact[]
  ): { severity: ModerationSeverity; count: number }[] {
    const counts = Object.values(ModerationSeverity).reduce<Record<ModerationSeverity, number>>(
      (acc, severity) => ({ ...acc, [severity]: 0 }),
      {} as Record<ModerationSeverity, number>
    );
    records.forEach((record) => {
      counts[record.severity] = (counts[record.severity] ?? 0) + 1;
    });
    return Object.entries(counts).map(([severity, count]) => ({
      severity: severity as ModerationSeverity,
      count,
    }));
  }

  private buildTrustTimeseries(
    records: AnalyticsTrustSignalFact[],
    timezoneOffset: number
  ): DashboardTimeseriesPoint[] {
    return this.buildTimeseries(
      records,
      timezoneOffset,
      (record) => record.severity === RiskSignalSeverity.high
    );
  }

  private buildModerationTimeseries(
    records: AnalyticsModerationFact[],
    timezoneOffset: number
  ): DashboardTimeseriesPoint[] {
    return this.buildTimeseries(
      records,
      timezoneOffset,
      (record) => record.severity === ModerationSeverity.critical
    );
  }

  private buildTimeseries<T extends { occurredAt: Date }>(
    records: T[],
    timezoneOffset: number,
    isCritical: (record: T) => boolean
  ): DashboardTimeseriesPoint[] {
    const buckets = new Map<string, { total: number; critical: number }>();
    records.forEach((record) => {
      const date = new Date(record.occurredAt);
      date.setMinutes(date.getMinutes() + timezoneOffset);
      const key = date.toISOString().slice(0, 10);
      const bucket = buckets.get(key) ?? { total: 0, critical: 0 };
      bucket.total += 1;
      if (isCritical(record)) {
        bucket.critical += 1;
      }
      buckets.set(key, bucket);
    });

    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, bucket]) => ({
        date,
        total: bucket.total,
        critical: bucket.critical || undefined,
      }));
  }

  private resolveRiskHealth(
    averageTrustScore: number,
    highSeverityRatio: number
  ): TrustPreviewRiskHealth {
    if (averageTrustScore < 60 || highSeverityRatio > 0.35) {
      return 'critical';
    }

    if (averageTrustScore < 75 || highSeverityRatio > 0.2) {
      return 'elevated';
    }

    return 'stable';
  }
}
