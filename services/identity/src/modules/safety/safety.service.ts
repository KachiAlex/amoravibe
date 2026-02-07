import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportReason, ReportStatus } from '@prisma/client';

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submit a safety report
   */
  async submitReport(data: {
    reporterId: string;
    reportedUserId?: string;
    reportedPostId?: string;
    reason: ReportReason;
    description: string;
    evidence?: string[];
  }): Promise<string | null> {
    try {
      const report = await this.prisma.safetyReport.create({
        data: {
          reporterId: data.reporterId,
          reportedUserId: data.reportedUserId,
          reportedPostId: data.reportedPostId,
          reason: data.reason,
          description: data.description,
          evidence: data.evidence ? JSON.stringify(data.evidence) : null,
          status: ReportStatus.submitted,
        },
      });

      return report.id;
    } catch (error) {
      console.error('[SafetyService] Error submitting report:', error);
      return null;
    }
  }

  /**
   * Get reports submitted by user
   */
  async getUserReports(userId: string, limit = 50) {
    try {
      const reports = await this.prisma.safetyReport.findMany({
        where: { reporterId: userId },
        include: {
          reportedUser: {
            select: { id: true, displayName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return reports.map((r) => ({
        ...r,
        evidence: r.evidence ? JSON.parse(r.evidence) : null,
      }));
    } catch (error) {
      console.error('[SafetyService] Error getting user reports:', error);
      return [];
    }
  }

  /**
   * Get user's blocked list
   */
  async getBlockedUsers(userId: string, limit = 50) {
    try {
      const blockedUsers = await this.prisma.blockedUser.findMany({
        where: { userId },
        include: {
          blocked: {
            select: {
              id: true,
              displayName: true,
              isVerified: true,
            },
          },
        },
        take: limit,
      });

      return blockedUsers;
    } catch (error) {
      console.error('[SafetyService] Error getting blocked users:', error);
      return [];
    }
  }

  /**
   * Block a user
   */
  async blockUser(userId: string, blockedId: string, reason?: string): Promise<boolean> {
    try {
      // Check if already blocked
      const existing = await this.prisma.blockedUser.findUnique({
        where: {
          userId_blockedId: { userId, blockedId },
        },
      });

      if (existing) {
        return false; // Already blocked
      }

      await this.prisma.blockedUser.create({
        data: {
          userId,
          blockedId,
          reason,
        },
      });

      return true;
    } catch (error) {
      console.error('[SafetyService] Error blocking user:', error);
      return false;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string, blockedId: string): Promise<boolean> {
    try {
      const result = await this.prisma.blockedUser.delete({
        where: {
          userId_blockedId: { userId, blockedId },
        },
      });

      return !!result;
    } catch (error) {
      console.error('[SafetyService] Error unblocking user:', error);
      return false;
    }
  }

  /**
   * Check if user is blocked
   */
  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const blocked = await this.prisma.blockedUser.findUnique({
        where: {
          userId_blockedId: { userId, blockedId: targetUserId },
        },
      });

      return !!blocked;
    } catch (error) {
      console.error('[SafetyService] Error checking block status:', error);
      return false;
    }
  }

  /**
   * Get moderation logs for user
   */
  async getUserModerationLogs(userId: string, skip = 0, limit = 50) {
    try {
      const logs = await this.prisma.moderationLog.findMany({
        where: { userId },
        include: {
          community: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      return logs;
    } catch (error) {
      console.error('[SafetyService] Error getting moderation logs:', error);
      return [];
    }
  }

  async getSafetyExperience(userId: string) {
    try {
      const [activeReports, activeModeration, health] = await Promise.all([
        this.prisma.safetyReport.count({
          where: {
            reporterId: userId,
            status: {
              in: [ReportStatus.submitted, ReportStatus.under_review],
            },
          },
        }),
        this.prisma.moderationLog.count({
          where: { userId },
        }),
        this.getProfileHealthScore(userId),
      ]);

      const trustScore = health?.trustScore ?? 50;
      const discoverySignal: 'positive' | 'neutral' | 'restricted' =
        trustScore >= 75 ? 'positive' : trustScore >= 55 ? 'neutral' : 'restricted';

      return {
        activeReports,
        activeModeration,
        trustScore,
        discoverySignal,
      };
    } catch (error) {
      console.error('[SafetyService] Error getting safety experience:', error);
      return {
        activeReports: 0,
        activeModeration: 0,
        trustScore: 50,
        discoverySignal: 'neutral',
      };
    }
  }

  /**
   * Get profile health score
   */
  async getProfileHealthScore(userId: string) {
    try {
      const health = await this.prisma.profileHealthScore.findUnique({
        where: { userId },
      });

      if (!health) {
        // Create default health score
        return await this.prisma.profileHealthScore.create({
          data: { userId },
        });
      }

      return health;
    } catch (error) {
      console.error('[SafetyService] Error getting profile health:', error);
      return null;
    }
  }

  /**
   * Update profile health score
   */
  async updateProfileHealth(userId: string, updates: {
    completenessPercent?: number;
    trustScore?: number;
    communityStanding?: number;
    reportCount?: number;
    banCount?: number;
  }): Promise<boolean> {
    try {
      await this.prisma.profileHealthScore.upsert({
        where: { userId },
        create: { userId, ...updates },
        update: updates,
      });

      return true;
    } catch (error) {
      console.error('[SafetyService] Error updating profile health:', error);
      return false;
    }
  }

  /**
   * Log moderation action
   */
  async logModerationAction(data: {
    userId: string;
    action: string;
    reason: string;
    severity?: number;
    communityId?: string;
    expiresAt?: Date;
  }): Promise<boolean> {
    try {
      await this.prisma.moderationLog.create({
        data: {
          userId: data.userId,
          action: data.action as any,
          reason: data.reason,
          severity: data.severity || 1,
          communityId: data.communityId,
          expiresAt: data.expiresAt,
        },
      });

      return true;
    } catch (error) {
      console.error('[SafetyService] Error logging moderation action:', error);
      return false;
    }
  }

  /**
   * Get report status
   */
  async getReportStatus(reportId: string) {
    try {
      const report = await this.prisma.safetyReport.findUnique({
        where: { id: reportId },
      });

      return report;
    } catch (error) {
      console.error('[SafetyService] Error getting report status:', error);
      return null;
    }
  }

  /**
   * Fetch or initialize safety tool settings
   */
  async getSafetyTools(userId: string) {
    try {
      const settings = await this.prisma.safetyToolSetting.findUnique({ where: { userId } });
      if (settings) {
        return settings;
      }

      return this.prisma.safetyToolSetting.create({
        data: { userId },
      });
    } catch (error) {
      console.error('[SafetyService] Error getting safety tools:', error);
      return null;
    }
  }

  /**
   * Update emergency contact details
   */
  async updateEmergencyContact(
    userId: string,
    contact: { name: string; phone: string; relationship?: string }
  ): Promise<boolean> {
    try {
      await this.prisma.safetyToolSetting.upsert({
        where: { userId },
        create: {
          userId,
          emergencyContactName: contact.name,
          emergencyContactPhone: contact.phone,
          emergencyContactRelationship: contact.relationship,
          emergencyContactUpdatedAt: new Date(),
        },
        update: {
          emergencyContactName: contact.name,
          emergencyContactPhone: contact.phone,
          emergencyContactRelationship: contact.relationship,
          emergencyContactUpdatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('[SafetyService] Error updating emergency contact:', error);
      return false;
    }
  }

  /**
   * Toggle location sharing controls
   */
  async updateLocationSharing(
    userId: string,
    payload: { enabled: boolean; expiresAt?: Date }
  ): Promise<boolean> {
    try {
      await this.prisma.safetyToolSetting.upsert({
        where: { userId },
        create: {
          userId,
          locationSharingEnabled: payload.enabled,
          locationSharingUpdatedAt: new Date(),
          locationSharingExpiresAt: payload.enabled ? payload.expiresAt ?? null : null,
        },
        update: {
          locationSharingEnabled: payload.enabled,
          locationSharingUpdatedAt: new Date(),
          locationSharingExpiresAt: payload.enabled ? payload.expiresAt ?? null : null,
        },
      });

      return true;
    } catch (error) {
      console.error('[SafetyService] Error updating location sharing:', error);
      return false;
    }
  }
}
