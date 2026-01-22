import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { DeviceService } from '../services/device.service';
import { DeviceCorrelationService } from '../services/device-correlation.service';
import { IngestDeviceFingerprintDto } from '../dto/ingest-device-fingerprint.dto';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly deviceCorrelationService: DeviceCorrelationService
  ) {}

  @Post('fingerprints')
  ingest(@Body() payload: IngestDeviceFingerprintDto) {
    return this.deviceService.ingest(payload);
  }

  @Get('users/:userId/fingerprints')
  listForUser(@Param('userId') userId: string) {
    return this.deviceService.listByUser(userId);
  }

  @Get('clusters')
  listClusters() {
    return this.deviceService.listSharedFingerprintClusters();
  }

  @Get('clusters/:hash')
  async getCluster(@Param('hash') hash: string) {
    const cluster = await this.deviceService.getClusterByHash(hash);
    if (!cluster) {
      throw new NotFoundException('Cluster not found');
    }

    return cluster;
  }
}
