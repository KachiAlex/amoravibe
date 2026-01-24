import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, AuditActorType, AuditEntityType } from '../../../prisma/client';
import { DeviceCluster, DeviceService } from './device.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';
import { ModerationSeverity } from '../../../common/enums/moderation-severity.enum';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class DeviceCorrelationService {
  private readonly logger = new Logger(DeviceCorrelationService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaClientLike,
    private readonly deviceService: DeviceService,
    private readonly auditService: AuditService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scanSharedFingerprints() {
    const clusters = await this.deviceService.listSharedFingerprintClusters();
    if (clusters.length === 0) {
      return;
    }

    this.logger.log(`Scanning ${clusters.length} shared fingerprint clusters`);
    for (const cluster of clusters) {
      await this.flagCluster(cluster);
    }
  }

  private async flagCluster(cluster: DeviceCluster) {
    const userIds = cluster.members
      .map((member) => member.userId)
      .filter((id): id is string => Boolean(id));

    if (userIds.length < 2) {
      return;
    }

    const message =
      'Shared device fingerprint detected across multiple profiles. Possible linked accounts.';

    for (const member of cluster.members) {
      if (!member.userId) {
        continue;
      }

      const existing = await this.prisma.moderationEvent.findFirst({
        where: {
          deviceFingerprintId: member.fingerprintId,
          message,
        },
      });

      if (existing) {
        continue;
      }

      await this.prisma.moderationEvent.create({
        data: {
          userId: member.userId,
          deviceFingerprintId: member.fingerprintId,
          severity: ModerationSeverity.WARNING,
          message,
          metadata: {
            clusterSize: userIds.length,
            hash: cluster.hash,
          } as Prisma.InputJsonValue,
        },
      });

      await this.auditService.logDeviceAlert(
        member.userId,
        message,
        ModerationSeverity.WARNING,
        member.fingerprintId,
        {
          actor: { type: AuditActorType.service, id: 'device_correlation_cron' },
          entity: { type: AuditEntityType.device_fingerprint, id: member.fingerprintId },
          channel: 'device_pipeline',
        }
      );
    }
  }
}
