import { Controller, Get, Param, Query } from '@nestjs/common';
import { MatchService } from './match.service';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get(':userId')
  async getMatches(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 12;
    const candidates = await this.matchService.findMatches(userId, parsedLimit);
    return {
      candidates,
      total: candidates.length,
      hasMore: candidates.length >= parsedLimit,
      generatedAt: new Date().toISOString(),
    };
  }
}
