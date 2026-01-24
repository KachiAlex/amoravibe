import { Injectable, Logger } from '@nestjs/common';
import { Prisma, RiskSignal } from '../../../prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TrustModelService } from './trust-model.service';
import { RiskProfileService } from './risk-profile.service';

@Injectable()
export class RiskScoringService {
  private readonly logger = new Logger(RiskScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly model: TrustModelService,
    private readonly profiles: RiskProfileService
  ) {}

  async evaluateSignal(signal: RiskSignal) {
    const result = this.model.scoreSignal(signal);

    await this.prisma.riskModelRun.create({
      data: {
        userId: signal.userId!,
        signalId: signal.id,
        modelVersion: 'heuristic-v1',
        algorithm: 'rule_based',
        features: result.featureVector as Prisma.JsonObject,
        output: { reasons: result.reasons } as Prisma.JsonObject,
        score: result.score,
      },
    });

    await this.prisma.riskSignal.update({
      where: { id: signal.id },
      data: {
        processedAt: new Date(),
        score: result.score,
      },
    });

    await this.profiles.applyEvaluation(signal.userId!, {
      score: result.score,
      features: result.featureVector,
      reasons: result.reasons,
    });

    if (result.score < 35) {
      this.logger.warn(`User ${signal.userId} flagged by Trust ML score ${result.score}`);
    }

    return result;
  }
}
