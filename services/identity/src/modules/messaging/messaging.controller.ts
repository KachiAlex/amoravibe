import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { MessagingService } from './messaging.service';

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 20;

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  @Get('threads/:userId')
  getThreads(@Param('userId', new ParseUUIDPipe()) userId: string, @Query('limit') limit?: string) {
    return this.messaging.getThreads(userId, this.normalizeLimit(limit));
  }

  private normalizeLimit(raw?: string): number {
    if (!raw) {
      return DEFAULT_LIMIT;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return DEFAULT_LIMIT;
    }

    return Math.min(Math.max(Math.floor(parsed), 1), MAX_LIMIT);
  }
}
