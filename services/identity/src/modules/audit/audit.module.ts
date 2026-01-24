import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';
import { AuditService } from './services/audit.service';
import { AuditCronService } from './services/audit-cron.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forFeature(), ConfigModule],
  providers: [AuditService, AuditCronService],
  exports: [AuditService],
})
export class AuditModule {}
