import { Inject, Injectable } from '@nestjs/common';
import { DeviceFingerprint, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IngestDeviceFingerprintDto } from '../dto/ingest-device-fingerprint.dto';
import { PrismaClientLike } from '../../../prisma/prisma.types';
import { AuditService } from '../../audit/services/audit.service';
import { ModerationSeverity } from '../../../common/enums/moderation-severity.enum';

export interface DeviceAlert {
  message: string;
  severity: ModerationSeverity;
}

export interface DeviceIngestResult {
  fingerprint: DeviceFingerprint;
  alerts: DeviceAlert[];
}

export interface DeviceClusterMember {
  userId: string | null;
  fingerprintId: string;
  observedAt: Date;
}

export interface DeviceCluster {
  hash: string;
  members: DeviceClusterMember[];
}

@Injectable()
export class DeviceService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaClientLike,
    private readonly auditService: AuditService
  ) {}

  async ingest(payload: IngestDeviceFingerprintDto): Promise<DeviceIngestResult> {
    const alerts: DeviceAlert[] = [];

    if (payload.userId) {
      const deviceCount = await this.prisma.deviceFingerprint.count({
        where: { userId: payload.userId },
      });
      if (deviceCount >= 3) {
        alerts.push({
          message: 'User has high device turnover. Review for account sharing.',
          severity: ModerationSeverity.WARNING,
        });
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
      alerts.push({
        message: 'Fingerprint hash observed on other profiles. Possible device spoofing.',
        severity: ModerationSeverity.CRITICAL,
      });
    }

    const riskLabel = this.deriveRiskLabel(alerts.map((alert) => alert.message));

    const fingerprint = await this.prisma.deviceFingerprint.create({
      data: {
        userId: payload.userId,
        hash: payload.hash,
        userAgent: payload.userAgent,
        signals: payload.signals as Prisma.InputJsonValue | undefined,
        riskLabel,
      },
    });

    if (alerts.length > 0) {
      for (const alert of alerts) {
        await this.prisma.moderationEvent.create({
          data: {
            userId: payload.userId ?? null,
            deviceFingerprintId: fingerprint.id,
            severity: alert.severity,
            message: alert.message,
            metadata: payload.signals as Prisma.InputJsonValue | undefined,
          },
        });

        if (payload.userId) {
          await this.auditService.logDeviceAlert(
            payload.userId,
            alert.message,
            alert.severity,
            fingerprint.id
          );
        }
      }
    }

    return { fingerprint, alerts };
  }

  listByUser(userId: string): Promise<DeviceFingerprint[]> {
    return this.prisma.deviceFingerprint.findMany({
      where: { userId },
      orderBy: { observedAt: 'desc' },
    });
  }

  listAlertsForFingerprint(deviceFingerprintId: string) {
    return this.prisma.moderationEvent.findMany({
      where: { deviceFingerprintId },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAlertsForUser(userId: string) {
    return this.prisma.moderationEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listSharedFingerprintClusters(): Promise<DeviceCluster[]> {
    const fingerprints = await this.prisma.deviceFingerprint.findMany({
      where: {},
      orderBy: { observedAt: 'desc' },
    });

    const clusterMap = new Map<string, DeviceClusterMember[]>();

    for (const fingerprint of fingerprints) {
      if (!fingerprint.userId) {
        continue;
      }
      const bucket = clusterMap.get(fingerprint.hash) ?? [];
      bucket.push({
        userId: fingerprint.userId ?? null,
        fingerprintId: fingerprint.id,
        observedAt: fingerprint.observedAt,
      });
      clusterMap.set(fingerprint.hash, bucket);
    }

    const clusters: DeviceCluster[] = [];
    for (const [hash, members] of clusterMap.entries()) {
      const userIds = members
        .map((member) => member.userId)
        .filter((id): id is string => Boolean(id));
      const uniqueUsers = new Set(userIds);
      if (uniqueUsers.size >= 2) {
        clusters.push({
          hash,
          members,
        });
      }
    }

    return clusters;
  }

  async getClusterByHash(hash: string): Promise<DeviceCluster | null> {
    const fingerprints = await this.prisma.deviceFingerprint.findMany({
      where: {},
      orderBy: { observedAt: 'desc' },
    });

    const members = fingerprints
      .filter((fingerprint) => fingerprint.hash === hash)
      .map((member) => ({
        userId: member.userId ?? null,
        fingerprintId: member.id,
        observedAt: member.observedAt,
      }));

    if (members.length === 0) {
      return null;
    }

    return {
      hash,
      members,
    };
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
