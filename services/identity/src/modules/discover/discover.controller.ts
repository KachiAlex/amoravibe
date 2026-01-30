import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { DiscoverFeedMode } from './dto/discover-feed.dto';
import { DiscoverEventDto } from './dto/discover-event.dto';

@Controller('discover')
export class DiscoverController {
  constructor(private readonly discover: DiscoverService) {}

  @Get('feed/:userId')
  getFeed(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('mode') mode?: DiscoverFeedMode,
    @Query('limit') limit?: string
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.discover.getFeed(userId, mode, parsedLimit);
  }

  @Post('events')
  logEvent(@Body() dto: DiscoverEventDto) {
    return this.discover.logEvent(dto);
  }
}
