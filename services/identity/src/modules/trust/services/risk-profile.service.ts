import { Injectable } from '@nestjs/common';
import { Prisma, RiskProfile } from '../../../prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

interface EvaluationResult {
  score: number;
  features: Record<string, number>;
  reasons: string[];
}

@Injectable()
export class RiskProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<RiskProfile> {
    return this.ensureProfile(userId);
  }

  async applyEvaluation(userId: string, evaluation: EvaluationResult) {
    const profile = await this.ensureProfile(userId);

    const mergedMetrics = {
      ...(profile.metrics as Record<string, number> | null | undefined),
      ...evaluation.features,
    } as Prisma.JsonObject | undefined;

    const updated = await this.prisma.riskProfile.update({
      where: { userId },
      data: {
        trustScore: Math.round(evaluation.score),
        metrics: mergedMetrics,
        lastEvaluatedAt: new Date(),
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        trustScore: updated.trustScore,
      },
    });

    return updated;
  }

  private ensureProfile(userId: string) {
    return this.prisma.riskProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }
}
