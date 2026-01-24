import { Injectable } from '@nestjs/common';
import { RiskSignal } from '../../../prisma/client';
import { RiskSignalSeverity, RiskSignalType } from '../../../common/enums/risk.enums';

export interface ModelScore {
  score: number;
  reasons: string[];
  featureVector: Record<string, number>;
}

const severityWeights: Record<RiskSignalSeverity, number> = {
  [RiskSignalSeverity.LOW]: -2,
  [RiskSignalSeverity.MEDIUM]: -8,
  [RiskSignalSeverity.HIGH]: -15,
  [RiskSignalSeverity.CRITICAL]: -25,
};

const typeWeights: Partial<Record<RiskSignalType, number>> = {
  [RiskSignalType.DEVICE_FINGERPRINT]: -10,
  [RiskSignalType.AUTH_PATTERN]: -12,
  [RiskSignalType.BEHAVIOR_ANOMALY]: -8,
  [RiskSignalType.CONTENT_VIOLATION]: -18,
  [RiskSignalType.MANUAL_REPORT]: -6,
};

@Injectable()
export class TrustModelService {
  scoreSignal(signal: RiskSignal): ModelScore {
    const reasons: string[] = [];
    const features: Record<string, number> = {
      bias: 1,
      severity_weight: severityWeights[signal.severity as RiskSignalSeverity] ?? 0,
      type_weight: typeWeights[signal.type as RiskSignalType] ?? 0,
      raw_score: signal.score ?? 0,
    };

    let score = 70; // optimistic baseline
    score += features.severity_weight;
    score += features.type_weight;
    score += Math.max(Math.min(features.raw_score, 20), -20);

    if (signal.deviceFingerprintId) {
      score -= 5;
      features.fingerprint_factor = -5;
      reasons.push('Device fingerprint linked to risk signal.');
    }

    if (signal.relatedUserId) {
      score -= 3;
      features.related_user_factor = -3;
      reasons.push('Linked account involvement.');
    }

    if (signal.severity === RiskSignalSeverity.CRITICAL) {
      reasons.push('Critical signal severity.');
    }

    score = Math.max(0, Math.min(100, score));

    if (score < 40) {
      reasons.push('Overall trust score below safe threshold.');
    }

    return { score, reasons, featureVector: features };
  }
}
