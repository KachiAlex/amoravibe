import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { RiskProfileService } from './risk-profile.service';
import { TrustFeatureService } from './trust-feature.service';
import { ModerationAutomationService } from './moderation-automation.service';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class TrustCronService {
  private readonly logger = new Logger(TrustCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: RiskProfileService,
    private readonly features: TrustFeatureService,
    private readonly moderationAutomation: ModerationAutomationService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async recomputeProfiles() {
    const staleSince = new Date(Date.now() - SIX_HOURS_MS);

    const [staleProfiles, missingProfiles] = await Promise.all([
      this.prisma.riskProfile.findMany({
        where: {
          OR: [{ lastEvaluatedAt: null }, { lastEvaluatedAt: { lt: staleSince } }],
        },
        select: { userId: true },
        take: 50,
      }),
      this.prisma.user.findMany({
        where: { riskProfile: null },
        select: { id: true },
        take: 25,
      }),
    ]);

    const candidates = Array.from(
      new Set([
        ...staleProfiles.map((profile) => profile.userId),
        ...missingProfiles.map((user) => user.id),
      ])
    );

    if (candidates.length === 0) {
      return;
    }

    this.logger.log(`Recomputing trust profiles for ${candidates.length} users`);

    for (const userId of candidates) {
      try {
        const aggregates = await this.features.buildUserAggregates(userId);
        const evaluation = this.evaluateFromAggregates(aggregates);
        const profile = await this.profiles.applyEvaluation(userId, evaluation);

        if (profile.trustScore < 35) {
          await this.moderationAutomation.flagLowTrustUser(userId, profile.trustScore, aggregates);
        }
      } catch (error) {
        this.logger.error(`Failed to recompute profile for ${userId}`, error as Error);
      }
    }
  }

  private evaluateFromAggregates(metrics: Record<string, number>) {
    const reasons: string[] = [];
    let score = 80;

    if (metrics.signals_last_24h) {
      score -= metrics.signals_last_24h * 2;
      if (metrics.signals_last_24h >= 5) {
        reasons.push('Spike in trust signals over the past 24 hours.');
      }
    }

    if (metrics.critical_signals_last_24h) {
      score -= metrics.critical_signals_last_24h * 10;
      reasons.push('Critical severity events detected recently.');
    }

    if (metrics.device_count && metrics.device_count > 3) {
      const penalty = (metrics.device_count - 3) * 2;
      score -= penalty;
      reasons.push('High number of devices associated with account.');
    }

    score = Math.max(0, Math.min(100, score));

    if (score < 40) {
      reasons.push('Automated heuristic score below safe threshold.');
    }

    return {
      score,
      features: metrics,
      reasons,
    };
  }
}
