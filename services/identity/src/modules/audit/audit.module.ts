import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';
import { AuditService } from './services/audit.service';
import { AuditCronService } from './services/audit-cron.service';
import { AuditPrivacyController } from './controllers/privacy.controller';
import { AuditApiKeyGuard } from './guards/audit-api-key.guard';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AuditPrivacyController],
  providers: [AuditService, AuditCronService, AuditApiKeyGuard],
  exports: [AuditService],
})
export class AuditModule {}
