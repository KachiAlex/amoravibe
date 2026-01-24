import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsInt, IsOptional, Min, Max } from 'class-validator';
import {
  AnalyticsPiiTier,
  RiskSignalSeverity,
  RiskSignalChannel,
  ModerationSeverity,
  Orientation,
} from '../../../prisma/client';

export class AnalyticsDashboardQueryDto {
  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;

  @IsOptional()
  @IsEnum(AnalyticsPiiTier)
  maxPiiTier?: AnalyticsPiiTier;

  @IsOptional()
  @IsEnum(Orientation)
  orientation?: Orientation;

  @IsOptional()
  @IsInt()
  @Min(-720)
  @Max(840)
  @Type(() => Number)
  timezoneOffsetMinutes?: number;
}

export interface DashboardTimeseriesPoint {
  date: string;
  total: number;
  critical?: number;
}

export interface TrustHealthSummary {
  snapshotCount: number;
  verifiedRate: number;
  averageTrustScore: number;
  orientationBreakdown: Array<{
    orientation: Orientation;
    percentage: number;
  }>;
}

export interface TrustSignalBreakdown {
  total: number;
  bySeverity: Array<{ severity: RiskSignalSeverity; count: number }>;
  byChannel: Array<{ channel: RiskSignalChannel; count: number }>;
  trend: DashboardTimeseriesPoint[];
}

export interface ModerationBreakdown {
  total: number;
  bySeverity: Array<{ severity: ModerationSeverity; count: number }>;
  trend: DashboardTimeseriesPoint[];
}

export interface AnalyticsDashboardResponse {
  window: { startDate: string; endDate: string; maxPiiTier: AnalyticsPiiTier };
  trustHealth: TrustHealthSummary;
  trustSignals: TrustSignalBreakdown;
  moderation: ModerationBreakdown;
}

export interface AnalyticsLeadershipReport {
  window: { startDate: string; endDate: string };
  trustHealth: {
    snapshotCount: number;
    verifiedRate: number;
    averageTrustScore: number;
  };
  trustSignals: {
    total: number;
    highSeverityPercentage: number;
  };
  moderation: {
    total: number;
    criticalPercentage: number;
  };
}
