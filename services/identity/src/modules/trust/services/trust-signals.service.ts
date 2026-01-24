import { Injectable, Logger } from '@nestjs/common';
import { Prisma, RiskSignal } from '../../../prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRiskSignalDto } from '../dto/create-risk-signal.dto';
import { RiskScoringService } from './risk-scoring.service';

@Injectable()
export class TrustSignalsService {
  private readonly logger = new Logger(TrustSignalsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: RiskScoringService
  ) {}

  async ingestSignal(dto: CreateRiskSignalDto): Promise<RiskSignal> {
    const featurePayload = dto.features?.reduce<Record<string, unknown>>((acc, feature) => {
      acc[feature.key] = feature.value ?? null;
      return acc;
    }, {});

    const signal = await this.prisma.riskSignal.create({
      data: {
        userId: dto.userId ?? null,
        relatedUserId: dto.relatedUserId ?? null,
        deviceFingerprintId: dto.deviceFingerprintId ?? null,
        type: dto.type,
        channel: dto.channel,
        severity: dto.severity,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        features: featurePayload as Prisma.InputJsonValue | undefined,
        score: dto.score ?? null,
      },
    });

    if (signal.userId) {
      await this.scoring.evaluateSignal(signal);
    } else {
      this.logger.warn(`Stored risk signal ${signal.id} without userId; skipped scoring.`);
    }

    return signal;
  }

  listForUser(userId: string) {
    return this.prisma.riskSignal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  listRecent(limit = 50) {
    return this.prisma.riskSignal.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
