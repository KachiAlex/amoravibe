import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DeviceService } from '../services/device.service';
import { IngestDeviceFingerprintDto } from '../dto/ingest-device-fingerprint.dto';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('fingerprints')
  ingest(@Body() payload: IngestDeviceFingerprintDto) {
    return this.deviceService.ingest(payload);
  }

  @Get('users/:userId/fingerprints')
  listForUser(@Param('userId') userId: string) {
    return this.deviceService.listByUser(userId);
  }
}
