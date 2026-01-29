import { Inject, Injectable, Optional } from '@nestjs/common';
import { Prisma, $Enums } from '../../../prisma/client';
import { AuditAction } from '../../../common/enums/audit-action.enum';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';
import { AppConfigService } from '../../../config/config.service';
import {
  AuditActorType,
  AuditEntityType,
  AuditExportRequest,
  AuditExportStatus,
  AuditPurgeRequest,
  AuditPurgeStatus,
} from '../../../prisma/client';

interface AuditLogInput {
  userId: string;
  verificationId?: string | null;
  action: AuditAction;
  details?: Record<string, unknown> | null;
  actor?: { type?: AuditActorType; id?: string | null };
  entity?: { type: AuditEntityType; id: string };
  channel?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogContext {
  actor?: { type?: AuditActorType; id?: string | null };
  entity?: { type: AuditEntityType; id: string };
  channel?: string;
  ipAddress?: string;
  userAgent?: string;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuditService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaClientLike,
    private readonly config: AppConfigService,
    @Optional() private readonly overrideConfig?: { retentionDays: number }
  ) {}

  private get auditEvents(): Prisma.AuditEventDelegate {
    return this.prisma.auditEvent as Prisma.AuditEventDelegate;
  }

  private get exportRequests(): Prisma.AuditExportRequestDelegate {
    return this.prisma.auditExportRequest as Prisma.AuditExportRequestDelegate;
  }

  private get purgeRequests(): Prisma.AuditPurgeRequestDelegate {
    return this.prisma.auditPurgeRequest as Prisma.AuditPurgeRequestDelegate;
  }

  log(input: AuditLogInput) {
    return this.auditEvents.create({
      data: {
        userId: input.userId,
        verificationId: input.verificationId ?? null,
        action: input.action as $Enums.AuditAction,
        details: this.toJsonValue(input.details),
        actorType: input.actor?.type ?? AuditActorType.system,
        actorId: input.actor?.id ?? null,
        entityType: input.entity?.type,
        entityId: input.entity?.id,
        channel: input.channel,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        expiresAt: this.computeExpiry(),
      },
    });
  }

  logVerificationInitiated(
    userId: string,
    verificationId: string,
    provider: string,
    context?: AuditLogContext
  ) {
    return this.log({
      userId,
      verificationId,
      action: AuditAction.VERIFICATION_INITIATED,
      details: { provider },
      actor: context?.actor,
      entity: context?.entity ?? { type: AuditEntityType.verification, id: verificationId },
      channel: context?.channel ?? 'verification_service',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
  }

  logVerificationStatusChange(
    userId: string,
    verificationId: string,
    previous: string,
    next: string,
    metadata?: Record<string, unknown>,
    context?: AuditLogContext
  ) {
    return this.log({
      userId,
      verificationId,
      action: AuditAction.VERIFICATION_STATUS_CHANGED,
      details: { previous, next, ...metadata },
      actor: context?.actor,
      entity: context?.entity ?? { type: AuditEntityType.verification, id: verificationId },
      channel: context?.channel ?? 'verification_service',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
  }

  logOrientationPoolDenied(
    userId: string,
    requestedPool: string,
    reason: string,
    context?: AuditLogContext
  ) {
    return this.log({
      userId,
      action: AuditAction.ORIENTATION_POOL_DENIED,
      details: { requestedPool, reason },
      actor: context?.actor,
      entity: context?.entity ?? { type: AuditEntityType.user, id: userId },
      channel: context?.channel ?? 'orientation_policy',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
  }

  logDeviceAlert(
    userId: string,
    alert: string,
    severity: string,
    deviceFingerprintId?: string,
    context?: AuditLogContext
  ) {
    return this.log({
      userId,
      action: AuditAction.DEVICE_ALERT_CREATED,
      details: { alert, severity, deviceFingerprintId },
      actor: context?.actor,
      entity:
        context?.entity ??
        (deviceFingerprintId
          ? { type: AuditEntityType.device_fingerprint, id: deviceFingerprintId }
          : undefined),
      channel: context?.channel ?? 'device_pipeline',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });
  }

  listForVerification(verificationId: string) {
    return this.auditEvents.findMany({
      where: { verificationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  listForUser(userId: string) {
    return this.auditEvents.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteExpiredEvents(before: Date) {
    return this.auditEvents.deleteMany({
      where: {
        expiresAt: {
          lt: before,
        },
      },
    });
  }

  requestExport(userId: string, payload?: Record<string, unknown>) {
    return this.exportRequests.create({
      data: {
        userId,
        status: AuditExportStatus.pending,
        payload: this.toJsonValue(payload) ?? Prisma.JsonNull,
      },
    });
  }

  fetchPendingExportRequests(limit = 5): Promise<AuditExportRequest[]> {
    return this.exportRequests.findMany({
      where: { status: AuditExportStatus.pending },
      orderBy: { requestedAt: 'asc' },
      take: limit,
    });
  }

  markExportProcessing(id: string) {
    return this.exportRequests.update({
      where: { id },
      data: { status: AuditExportStatus.processing },
    });
  }

  completeExport(id: string, storageLocation: string) {
    return this.exportRequests.update({
      where: { id },
      data: {
        status: AuditExportStatus.completed,
        storageLocation,
        processedAt: new Date(),
      },
    });
  }

  failExport(id: string, reason: string) {
    return this.exportRequests.update({
      where: { id },
      data: {
        status: AuditExportStatus.failed,
        failureReason: reason,
        processedAt: new Date(),
      },
    });
  }

  requestPurge(userId: string, reason?: string) {
    return this.purgeRequests.create({
      data: {
        userId,
        status: AuditPurgeStatus.pending,
        reason: reason ?? null,
      },
    });
  }

  fetchPendingPurgeRequests(limit = 5): Promise<AuditPurgeRequest[]> {
    return this.purgeRequests.findMany({
      where: { status: AuditPurgeStatus.pending },
      orderBy: { requestedAt: 'asc' },
      take: limit,
    });
  }

  markPurgeProcessing(id: string) {
    return this.purgeRequests.update({
      where: { id },
      data: { status: AuditPurgeStatus.processing },
    });
  }

  completePurge(id: string) {
    return this.purgeRequests.update({
      where: { id },
      data: {
        status: AuditPurgeStatus.completed,
        processedAt: new Date(),
      },
    });
  }

  failPurge(id: string, reason: string) {
    return this.purgeRequests.update({
      where: { id },
      data: {
        status: AuditPurgeStatus.failed,
        processedAt: new Date(),
        reason,
      },
    });
  }

  async purgeUserEvents(userId: string) {
    await this.auditEvents.deleteMany({ where: { userId } });
  }

  private computeExpiry() {
    const retentionDays = this.overrideConfig?.retentionDays ?? this.config.audit.retentionDays;
    return new Date(Date.now() + retentionDays * DAY_IN_MS);
  }

  private toJsonValue(value?: Record<string, unknown> | null) {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return Prisma.JsonNull;
    }
    return value as Prisma.InputJsonValue;
  }
}
