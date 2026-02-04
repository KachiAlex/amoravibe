import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, AuditActorType, AuditEntityType } from '../../prisma/prisma.types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit event
   * All dashboard actions should call this
   */
  async logAction(params: {
    userId: string;
    action: AuditAction;
    actorType?: AuditActorType;
    actorId?: string;
    entityType?: AuditEntityType;
    entityId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      // Audit records expire after 90 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      await this.prisma.auditEvent.create({
        data: {
          userId: params.userId,
          action: params.action,
          actorType: params.actorType || 'user',
          actorId: params.actorId,
          entityType: params.entityType,
          entityId: params.entityId,
          details: params.details,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          expiresAt,
        },
      });
    } catch (error) {
      // Don't throw - audit failures shouldn't break user flows
      this.logger.error(`Failed to log audit event for user ${params.userId}:`, error);
    }
  }

  /**
   * Helper: Log a like action
   */
  async logLike(senderId: string, receiverId: string, details?: any): Promise<void> {
    await this.logAction({
      userId: senderId,
      action: 'verification_initiated', // TODO: Add LIKE action to enum
      entityType: 'user',
      entityId: receiverId,
      details,
    });
  }

  /**
   * Helper: Log a message
   */
  async logMessage(
    senderId: string,
    receiverId: string,
    messageId: string,
    details?: any
  ): Promise<void> {
    await this.logAction({
      userId: senderId,
      action: 'verification_initiated', // TODO: Add MESSAGE action to enum
      entityType: 'user',
      entityId: receiverId,
      details: { messageId, ...details },
    });
  }

  /**
   * Helper: Log a block action
   */
  async logBlock(userId: string, blockedUserId: string, reason?: string): Promise<void> {
    await this.logAction({
      userId,
      action: 'verification_initiated', // TODO: Add BLOCK action to enum
      entityType: 'user',
      entityId: blockedUserId,
      details: { reason },
    });
  }

  /**
   * Helper: Log a report
   */
  async logReport(
    reporterId: string,
    reportedUserId: string,
    reason: string,
    details?: any
  ): Promise<void> {
    await this.logAction({
      userId: reporterId,
      action: 'verification_initiated', // TODO: Add REPORT action to enum
      entityType: 'user',
      entityId: reportedUserId,
      details: { reason, ...details },
    });
  }

  /**
   * Get audit trail for a user (admin only)
   */
  async getUserAuditTrail(userId: string, limit = 100): Promise<any[]> {
    try {
      const events = await this.prisma.auditEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return events;
    } catch (error) {
      this.logger.error(`Error fetching audit trail for ${userId}:`, error);
      return [];
    }
  }
}
