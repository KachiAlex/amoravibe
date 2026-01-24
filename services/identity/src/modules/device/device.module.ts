import { Module } from '@nestjs/common';
import { DeviceController } from './controllers/device.controller';
import { DeviceService } from './services/device.service';
import { DeviceCorrelationService } from './services/device-correlation.service';
import { AuditModule } from '../audit/audit.module';
import { TrustModule } from '../trust/trust.module';

@Module({
  imports: [AuditModule, TrustModule],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceCorrelationService],
  exports: [DeviceService, DeviceCorrelationService],
})
export class DeviceModule {}
