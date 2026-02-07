import { Inject, Injectable, Optional } from '@nestjs/common';
import { Prisma } from '../../../prisma/client';
import { AuditAction } from '../../../common/enums/audit-action.enum';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';
import { AppConfigService } from '../../../config/config.service';
import {
  AuditActorType,
  AuditEntityType,
} from '../../../prisma/audit.stubs';

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

  // Stub methods - AuditEvent table does not exist in SQLite schema
  private get auditEvents() {
    return null as any;
  }

  private get exportRequests() {
    return null as any;
  }

  private get purgeRequests() {
    return null as any;
  }

  log(input: AuditLogInput) {
    // Audit logging disabled in SQLite dev mode
    return Promise.resolve(null);
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


  // Export/Purge methods disabled in SQLite dev mode
  requestExport(userId: string, payload?: Record<string, unknown>) {
    return Promise.resolve(null);
  }

  fetchPendingExportRequests(limit = 5) {
    return Promise.resolve([]);
  }

  markExportProcessing(id: string) {
    return Promise.resolve(null);
  }

  completeExport(id: string, storageLocation: string) {
    return Promise.resolve(null);
  }

  failExport(id: string, reason: string) {
    return Promise.resolve(null);
  }

  requestPurge(userId: string, reason?: string) {
    return Promise.resolve(null);
  }

  fetchPendingPurgeRequests(limit = 5) {
    return Promise.resolve([]);
  }

  markPurgeProcessing(id: string) {
    return Promise.resolve(null);
  }

  completePurge(id: string) {
    return Promise.resolve(null);
  }

  failPurge(id: string, reason: string) {
    return Promise.resolve(null);
  }

  async purgeUserEvents(userId: string) {
    // Purge disabled in SQLite dev mode
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
