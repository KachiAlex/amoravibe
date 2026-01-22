import { Module } from '@nestjs/common';
import { DeviceController } from './controllers/device.controller';
import { DeviceService } from './services/device.service';
import { DeviceCorrelationService } from './services/device-correlation.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceCorrelationService],
  exports: [DeviceService, DeviceCorrelationService],
})
export class DeviceModule {}
