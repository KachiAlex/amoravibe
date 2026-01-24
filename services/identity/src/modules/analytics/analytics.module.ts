import { Module } from '@nestjs/common';
import { AnalyticsIngestionService } from './services/analytics-ingestion.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [AnalyticsIngestionService],
  exports: [AnalyticsIngestionService],
})
export class AnalyticsModule {}
