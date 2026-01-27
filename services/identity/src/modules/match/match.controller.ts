import { Controller, Get, Query } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchQueryDto } from './dto/match-query.dto';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  list(@Query() query: MatchQueryDto) {
    return this.matchService.findMatches(query.userId, query.limit);
  }
}
