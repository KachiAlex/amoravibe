import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsDashboardService } from './services/analytics-dashboard.service';
import { AnalyticsDashboardQueryDto } from './dto/analytics-dashboard.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly dashboard: AnalyticsDashboardService) {}

  @Get('dashboard')
  getDashboard(@Query() query: AnalyticsDashboardQueryDto) {
    return this.dashboard.getDashboard(query);
  }
}
