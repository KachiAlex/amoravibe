import { Inject, Injectable } from '@nestjs/common';
import { Prisma, $Enums } from '../../../prisma/client';
import { AuditAction } from '../../../common/enums/audit-action.enum';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';

interface AuditLogInput {
  userId: string;
  verificationId?: string | null;
  action: AuditAction;
  details?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  private get auditEvents(): Prisma.AuditEventDelegate {
    return this.prisma.auditEvent as Prisma.AuditEventDelegate;
  }

  log(input: AuditLogInput) {
    return this.auditEvents.create({
      data: {
        userId: input.userId,
        verificationId: input.verificationId ?? null,
        action: input.action as $Enums.AuditAction,
        details: this.toJsonValue(input.details),
      },
    });
  }

  logVerificationInitiated(userId: string, verificationId: string, provider: string) {
    return this.log({
      userId,
      verificationId,
      action: AuditAction.VERIFICATION_INITIATED,
      details: { provider },
    });
  }

  logVerificationStatusChange(
    userId: string,
    verificationId: string,
    previous: string,
    next: string,
    metadata?: Record<string, unknown>
  ) {
    return this.log({
      userId,
      verificationId,
      action: AuditAction.VERIFICATION_STATUS_CHANGED,
      details: { previous, next, ...metadata },
    });
  }

  logOrientationPoolDenied(userId: string, requestedPool: string, reason: string) {
    return this.log({
      userId,
      action: AuditAction.ORIENTATION_POOL_DENIED,
      details: { requestedPool, reason },
    });
  }

  logDeviceAlert(userId: string, alert: string, severity: string, deviceFingerprintId?: string) {
    return this.log({
      userId,
      action: AuditAction.DEVICE_ALERT_CREATED,
      details: { alert, severity, deviceFingerprintId },
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
