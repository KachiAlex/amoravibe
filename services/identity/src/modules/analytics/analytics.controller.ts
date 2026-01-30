import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsDashboardService } from './services/analytics-dashboard.service';
import { AnalyticsDashboardQueryDto } from './dto/analytics-dashboard.dto';
import { AnalyticsTierGuard } from './guards/analytics-tier.guard';
import { AnalyticsPiiTier } from '../../prisma/client';
import { AuditService } from '../audit/services/audit.service';
import { AuditAction } from '../../common/enums/audit-action.enum';

interface AnalyticsRequest extends Request {
  analyticsTier?: AnalyticsPiiTier;
  analyticsActorId?: string;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly dashboard: AnalyticsDashboardService,
    private readonly auditService: AuditService
  ) {}

  @Get('dashboard')
  @UseGuards(AnalyticsTierGuard)
  getDashboard(@Query() query: AnalyticsDashboardQueryDto, @Req() req: AnalyticsRequest) {
    const resolvedTier = query.maxPiiTier ?? req.analyticsTier ?? AnalyticsPiiTier.aggregate;
    void this.auditService.log({
      userId: req.analyticsActorId ?? 'unknown-actor',
      action: AuditAction.ANALYTICS_DASHBOARD_ACCESSED,
      details: {
        startDate: query.startDate,
        endDate: query.endDate,
        requestedTier: query.maxPiiTier ?? null,
        resolvedTier,
        orientation: query.orientation ?? null,
      },
      channel: 'analytics_dashboard',
      actor: { type: undefined, id: req.analyticsActorId ?? null },
    });

    return this.dashboard.getDashboard({ ...query, maxPiiTier: resolvedTier });
  }

  @Get('trust-preview')
  getTrustPreview() {
    return this.dashboard.getTrustPreview();
  }

  @Get('leadership-report')
  @UseGuards(AnalyticsTierGuard)
  async getLeadershipReport(
    @Query() query: AnalyticsDashboardQueryDto,
    @Req() req: AnalyticsRequest
  ) {
    const baseQuery = { ...query, maxPiiTier: AnalyticsPiiTier.aggregate };
    const dashboard = await this.dashboard.getDashboard(baseQuery);
    const report = this.dashboard.mapToLeadershipReport(dashboard);
    void this.auditService.log({
      userId: req.analyticsActorId ?? 'unknown-actor',
      action: AuditAction.ANALYTICS_DASHBOARD_ACCESSED,
      details: {
        reportType: 'leadership_aggregate',
        startDate: query.startDate,
        endDate: query.endDate,
      },
      channel: 'analytics_dashboard',
      actor: { type: undefined, id: req.analyticsActorId ?? null },
    });
    return report;
  }
}
