export type TrustPreviewRiskHealth = 'stable' | 'elevated' | 'critical';

export interface TrustPreviewStatsDto {
  verificationPassRate: number;
  riskHealth: TrustPreviewRiskHealth;
  exportSlaHours: number;
}

export interface TrustPreviewJourneyStepDto {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export interface TrustPreviewHighlightDto {
  title: string;
  body: string;
  badge: string;
}

export interface TrustPreviewResponseDto {
  snapshotLabel: string;
  stats: TrustPreviewStatsDto;
  journey: TrustPreviewJourneyStepDto[];
  highlights: TrustPreviewHighlightDto[];
}
