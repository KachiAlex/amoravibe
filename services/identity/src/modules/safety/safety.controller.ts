import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { SafetyService } from './safety.service';
import { ReportReason } from '@prisma/client';

@Controller('api/v1/safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Post('report')
  async submitReport(
    @Body()
    body: {
      reporterId: string;
      reportedUserId?: string;
      reportedPostId?: string;
      reason: ReportReason;
      description: string;
      evidence?: string[];
    }
  ) {
    const reportId = await this.safetyService.submitReport(body);
    return {
      success: !!reportId,
      reportId,
      message: reportId ? 'Report submitted' : 'Failed to submit report',
    };
  }

  @Get('reports')
  async getUserReports(@Query('userId') userId: string, @Query('limit') limit?: string) {
    const reports = await this.safetyService.getUserReports(userId, limit ? parseInt(limit) : 50);
    return { reports, total: reports.length };
  }

  @Get('report/:reportId')
  async getReportStatus(@Param('reportId') reportId: string) {
    const report = await this.safetyService.getReportStatus(reportId);
    return { report };
  }

  @Get('blocked-users')
  async getBlockedUsers(@Query('userId') userId: string, @Query('limit') limit?: string) {
    const blockedUsers = await this.safetyService.getBlockedUsers(
      userId,
      limit ? parseInt(limit) : 50
    );
    return { blockedUsers, total: blockedUsers.length };
  }

  @Post('block')
  async blockUser(@Body() body: { userId: string; blockedId: string; reason?: string }) {
    const success = await this.safetyService.blockUser(body.userId, body.blockedId, body.reason);
    return { success, message: success ? 'User blocked' : 'Failed to block user' };
  }

  @Post('unblock')
  async unblockUser(@Body() body: { userId: string; blockedId: string }) {
    const success = await this.safetyService.unblockUser(body.userId, body.blockedId);
    return { success, message: success ? 'User unblocked' : 'Failed to unblock user' };
  }

  @Get('is-blocked')
  async isBlocked(@Query('userId') userId: string, @Query('targetUserId') targetUserId: string) {
    const blocked = await this.safetyService.isUserBlocked(userId, targetUserId);
    return { blocked };
  }

  @Get('moderation-logs')
  async getModerationLogs(
    @Query('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.safetyService.getUserModerationLogs(
      userId,
      skip ? parseInt(skip) : 0,
      limit ? parseInt(limit) : 50,
    );
    return { logs, total: logs.length };
  }

  @Get('experience')
  async getSafetyExperience(@Query('userId') userId: string) {
    const experience = await this.safetyService.getSafetyExperience(userId);
    return { experience };
  }

  @Get('profile-health')
  async getProfileHealth(@Query('userId') userId: string) {
    const health = await this.safetyService.getProfileHealthScore(userId);
    return { health };
  }

  @Post('profile-health')
  async updateProfileHealth(
    @Body()
    body: {
      userId: string;
      completenessPercent?: number;
      trustScore?: number;
      communityStanding?: number;
      reportCount?: number;
      banCount?: number;
    }
  ) {
    const success = await this.safetyService.updateProfileHealth(body.userId, body);
    return { success };
  }

  @Post('moderation-log')
  async logModerationAction(
    @Body()
    body: {
      userId: string;
      action: string;
      reason: string;
      severity?: number;
      communityId?: string;
      expiresAt?: Date;
    }
  ) {
    const success = await this.safetyService.logModerationAction(body);
    return { success };
  }

  @Get('tools')
  async getSafetyTools(@Query('userId') userId: string) {
    const tools = await this.safetyService.getSafetyTools(userId);
    return { tools };
  }

  @Post('emergency-contact')
  async updateEmergencyContact(
    @Body() body: { userId: string; name: string; phone: string; relationship?: string }
  ) {
    const success = await this.safetyService.updateEmergencyContact(body.userId, {
      name: body.name,
      phone: body.phone,
      relationship: body.relationship,
    });
    return { success };
  }

  @Post('location-sharing')
  async updateLocationSharing(
    @Body() body: { userId: string; enabled: boolean; expiresAt?: Date | string }
  ) {
    const success = await this.safetyService.updateLocationSharing(body.userId, {
      enabled: body.enabled,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    return { success };
  }
}
