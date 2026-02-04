import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get(':userId')
  async getMatches(@Param('userId') userId: string, @Query('limit') limit?: number) {
    const matches = await this.matchingService.getMatches(userId, limit);

    return {
      candidates: matches,
      total: matches.length,
      hasMore: false,
      generatedAt: new Date().toISOString(),
    };
  }
}
