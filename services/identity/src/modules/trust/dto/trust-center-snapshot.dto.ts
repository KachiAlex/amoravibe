import { VerificationStatus } from '../../../common/enums/verification-status.enum';
import { ModerationSeverity } from '../../../common/enums/moderation-severity.enum';
import {
  RiskSignalChannel,
  RiskSignalSeverity,
  RiskSignalType,
} from '../../../common/enums/risk.enums';

export interface TrustCenterUserDto {
  id: string;
  displayName: string;
  isVerified: boolean;
  trustScore: number;
  createdAt: Date;
}

export interface TrustCenterVerificationDto {
  id: string;
  provider: string;
  status: VerificationStatus;
  updatedAt: Date | null;
}

export interface TrustCenterRiskProfileDto {
  trustScore: number;
  lastEvaluatedAt: Date | null;
  metrics: Record<string, unknown> | null;
}

export interface TrustCenterDeviceDto {
  id: string;
  hash: string;
  observedAt: Date;
  riskLabel: string | null;
  userAgent: string | null;
}

export interface TrustCenterRiskSignalDto {
  id: string;
  type: RiskSignalType;
  channel: RiskSignalChannel;
  severity: RiskSignalSeverity;
  score: number | null;
  createdAt: Date;
}

export interface TrustCenterModerationEventDto {
  id: string;
  severity: ModerationSeverity;
  message: string;
  createdAt: Date;
}

export interface TrustCenterAuditSummaryDto {
  totalEvents: number;
  lastEventAt: Date | null;
}

export interface TrustCenterSnapshotDto {
  user: TrustCenterUserDto;
  verification: TrustCenterVerificationDto | null;
  riskProfile: TrustCenterRiskProfileDto | null;
  devices: TrustCenterDeviceDto[];
  riskSignals: TrustCenterRiskSignalDto[];
  moderationEvents: TrustCenterModerationEventDto[];
  auditSummary: TrustCenterAuditSummaryDto;
}
