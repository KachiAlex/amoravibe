import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CasesModule } from '../cases/cases.module';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';

@Module({
  imports: [PrismaModule, CasesModule],
  providers: [AutomationService],
  controllers: [AutomationController],
  exports: [AutomationService],
})
export class AutomationModule {}
