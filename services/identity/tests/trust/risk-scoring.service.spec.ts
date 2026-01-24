import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { RiskScoringService } from '../../src/modules/trust/services/risk-scoring.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  TrustModelService,
  ModelScore,
} from '../../src/modules/trust/services/trust-model.service';
import { RiskProfileService } from '../../src/modules/trust/services/risk-profile.service';
import { RiskSignal } from '../../src/prisma/client';
import {
  RiskSignalChannel,
  RiskSignalSeverity,
  RiskSignalType,
} from '../../src/common/enums/risk.enums';

const buildSignal = (overrides: Partial<RiskSignal> = {}): RiskSignal =>
  ({
    id: 'sig-1',
    userId: 'user-1',
    relatedUserId: null,
    deviceFingerprintId: null,
    type: RiskSignalType.DEVICE_FINGERPRINT,
    channel: RiskSignalChannel.DEVICE_PIPELINE,
    severity: RiskSignalSeverity.MEDIUM,
    metadata: null,
    features: null,
    score: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    processedAt: null,
    ...overrides,
  }) as RiskSignal;

describe('RiskScoringService', () => {
  let prisma: PrismaService;
  let model: TrustModelService;
  let profiles: RiskProfileService;
  let service: RiskScoringService;

  beforeEach(() => {
    prisma = {
      riskModelRun: {
        create: vi.fn().mockResolvedValue({ id: 'run-1' }),
      },
      riskSignal: {
        update: vi.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaService;

    model = {
      scoreSignal: vi.fn(),
    } as unknown as TrustModelService;

    profiles = {
      applyEvaluation: vi.fn(),
    } as unknown as RiskProfileService;

    service = new RiskScoringService(prisma, model, profiles);
  });

  it('persists model runs, updates signals, and refreshes risk profiles', async () => {
    const signal = buildSignal();
    const score: ModelScore = {
      score: 58,
      reasons: ['moderate risk signal'],
      featureVector: { severity_weight: -8, bias: 1 },
    };
    (model.scoreSignal as ReturnType<typeof vi.fn>).mockReturnValue(score);

    const result = await service.evaluateSignal(signal);

    expect(model.scoreSignal).toHaveBeenCalledWith(signal);
    expect(prisma.riskModelRun.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: signal.userId,
        signalId: signal.id,
        modelVersion: 'heuristic-v1',
        score: score.score,
        features: score.featureVector,
      }),
    });
    expect(prisma.riskSignal.update).toHaveBeenCalledWith({
      where: { id: signal.id },
      data: {
        processedAt: expect.any(Date),
        score: score.score,
      },
    });
    expect(profiles.applyEvaluation).toHaveBeenCalledWith(signal.userId, {
      score: score.score,
      features: score.featureVector,
      reasons: score.reasons,
    });
    expect(result).toEqual(score);
  });

  it('logs a warning when the score drops below the trust threshold', async () => {
    const signal = buildSignal();
    const score: ModelScore = {
      score: 20,
      reasons: ['critically low score'],
      featureVector: { severity_weight: -25 },
    };
    (model.scoreSignal as ReturnType<typeof vi.fn>).mockReturnValue(score);

    const logger = (service as unknown as { logger: Logger }).logger;
    const warnSpy = vi.spyOn(logger, 'warn');

    await service.evaluateSignal(signal);

    expect(warnSpy).toHaveBeenCalledWith(
      `User ${signal.userId} flagged by Trust ML score ${score.score}`
    );
  });
});
