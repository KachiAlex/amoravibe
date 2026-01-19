import { Module } from '@nestjs/common';
import { DeviceController } from './controllers/device.controller';
import { DeviceService } from './services/device.service';

@Module({
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
