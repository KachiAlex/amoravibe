import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RiskSignalSeverity } from '../../../common/enums/risk.enums';

@Injectable()
export class TrustFeatureService {
  constructor(private readonly prisma: PrismaService) {}

  async buildUserAggregates(userId: string) {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [signalsLast24h, criticalLast24h, deviceCount] = await Promise.all([
      this.prisma.riskSignal.count({
        where: {
          userId,
          createdAt: { gte: since24h },
        },
      }),
      this.prisma.riskSignal.count({
        where: {
          userId,
          severity: RiskSignalSeverity.CRITICAL,
          createdAt: { gte: since24h },
        },
      }),
      this.prisma.deviceFingerprint.count({ where: { userId } }),
    ]);

    return {
      signals_last_24h: signalsLast24h,
      critical_signals_last_24h: criticalLast24h,
      device_count: deviceCount,
    } satisfies Record<string, number>;
  }
}
