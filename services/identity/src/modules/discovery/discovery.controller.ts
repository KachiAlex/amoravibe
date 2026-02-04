import { Controller, Get, Query, Req } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { Request } from 'express';

@Controller('discovery')
export class DiscoveryController {
  constructor(private discoveryService: DiscoveryService) {}

  @Get('feed')
  async getDiscoveryFeed(
    @Req() req: Request,
    @Query('userId') userId: string,
    @Query('mode') mode: string = 'default',
    @Query('limit') limit: string = '12'
  ) {
    if (!userId) {
      return { error: 'userId required', profiles: [] };
    }

    const profiles = await this.discoveryService.getDiscoveryFeed(
      userId,
      (mode as any) || 'default',
      Math.min(parseInt(limit) || 12, 50) // Cap at 50
    );

    return {
      hero: null,
      featured: [],
      grid: profiles,
      filters: [],
      mode: mode || 'default',
      total: profiles.length,
      generatedAt: new Date().toISOString(),
    };
  }
}
