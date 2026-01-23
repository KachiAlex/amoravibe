import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { CasesModule } from './modules/cases/cases.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AutomationModule } from './modules/automation/automation.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, CasesModule, ReportsModule, AutomationModule],
})
export class AppModule {}
