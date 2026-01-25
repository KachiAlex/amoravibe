import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TrustCenterSnapshotDto } from '../dto/trust-center-snapshot.dto';

const DEVICE_LIMIT = 5;
const SIGNAL_LIMIT = 5;
const MODERATION_LIMIT = 5;

@Injectable()
export class TrustCenterService {
  constructor(private readonly prisma: PrismaService) {}

  async getSnapshot(userId: string): Promise<TrustCenterSnapshotDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const [
      verification,
      riskProfile,
      devices,
      riskSignals,
      moderationEvents,
      auditCount,
      latestAudit,
    ] = await Promise.all([
      this.prisma.verification.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.riskProfile.findUnique({ where: { userId } }),
      this.prisma.deviceFingerprint.findMany({
        where: { userId },
        orderBy: { observedAt: 'desc' },
        take: DEVICE_LIMIT,
      }),
      this.prisma.riskSignal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: SIGNAL_LIMIT,
      }),
      this.prisma.moderationEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: MODERATION_LIMIT,
      }),
      this.prisma.auditEvent.count({ where: { userId } }),
      this.prisma.auditEvent.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        isVerified: user.isVerified,
        trustScore: user.trustScore,
        createdAt: user.createdAt,
      },
      verification: verification
        ? {
            id: verification.id,
            provider: verification.provider,
            status: verification.status,
            updatedAt: verification.updatedAt,
          }
        : null,
      riskProfile: riskProfile
        ? {
            trustScore: riskProfile.trustScore,
            lastEvaluatedAt: riskProfile.lastEvaluatedAt,
            metrics: (riskProfile.metrics as Record<string, unknown> | null) ?? null,
          }
        : null,
      devices: devices.map((device) => ({
        id: device.id,
        hash: device.hash,
        observedAt: device.observedAt,
        riskLabel: device.riskLabel,
        userAgent: device.userAgent ?? null,
      })),
      riskSignals: riskSignals.map((signal) => ({
        id: signal.id,
        type: signal.type,
        channel: signal.channel,
        severity: signal.severity,
        score: signal.score ?? null,
        createdAt: signal.createdAt,
      })),
      moderationEvents: moderationEvents.map((event) => ({
        id: event.id,
        severity: event.severity,
        message: event.message,
        createdAt: event.createdAt,
      })),
      auditSummary: {
        totalEvents: auditCount,
        lastEventAt: latestAudit?.createdAt ?? null,
      },
    };
  }
}
