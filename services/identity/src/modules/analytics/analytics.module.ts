import { Module } from '@nestjs/common';
import { AnalyticsIngestionService } from './services/analytics-ingestion.service';
import { AnalyticsDashboardService } from './services/analytics-dashboard.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsTierGuard } from './guards/analytics-tier.guard';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsIngestionService, AnalyticsDashboardService, AnalyticsTierGuard],
  exports: [AnalyticsIngestionService, AnalyticsDashboardService],
})
export class AnalyticsModule {}
