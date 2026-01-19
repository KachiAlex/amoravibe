import { Inject, Injectable } from '@nestjs/common';
import { DeviceFingerprint, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IngestDeviceFingerprintDto } from '../dto/ingest-device-fingerprint.dto';
import { PrismaClientLike } from '../../../prisma/prisma.types';

export interface DeviceIngestResult {
  fingerprint: DeviceFingerprint;
  alerts: string[];
}

@Injectable()
export class DeviceService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async ingest(payload: IngestDeviceFingerprintDto): Promise<DeviceIngestResult> {
    const alerts: string[] = [];

    if (payload.userId) {
      const deviceCount = await this.prisma.deviceFingerprint.count({
        where: { userId: payload.userId },
      });
      if (deviceCount >= 3) {
        alerts.push('User has high device turnover. Review for account sharing.');
      }
    }

    const sharedHashUsers = await this.prisma.deviceFingerprint.findMany({
      where: {
        hash: payload.hash,
        userId: { not: payload.userId ?? undefined },
      },
      select: { userId: true },
      distinct: ['userId'],
      take: 2,
    });
    if (sharedHashUsers.length > 0) {
      alerts.push('Fingerprint hash observed on other profiles. Possible device spoofing.');
    }

    const riskLabel = this.deriveRiskLabel(alerts);

    const fingerprint = await this.prisma.deviceFingerprint.create({
      data: {
        userId: payload.userId,
        hash: payload.hash,
        userAgent: payload.userAgent,
        signals: payload.signals as Prisma.InputJsonValue | undefined,
        riskLabel,
      },
    });

    return { fingerprint, alerts };
  }

  listByUser(userId: string): Promise<DeviceFingerprint[]> {
    return this.prisma.deviceFingerprint.findMany({
      where: { userId },
      orderBy: { observedAt: 'desc' },
    });
  }

  private deriveRiskLabel(alerts: string[]): string | null {
    if (alerts.length === 0) {
      return null;
    }
    if (alerts.some((alert) => alert.includes('spoofing'))) {
      return 'high';
    }
    return 'medium';
  }
}
