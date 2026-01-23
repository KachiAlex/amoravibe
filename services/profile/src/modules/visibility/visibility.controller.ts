import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { VisibilityPool } from '../../common/enums/visibility-pool.enum';
import { UpsertVisibilityRuleDto } from './dto/upsert-visibility-rule.dto';

@Controller('profiles/:profileId/visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}

  @Get('rules')
  listRules(@Param('profileId', new ParseUUIDPipe()) profileId: string) {
    return this.visibilityService.listRules(profileId);
  }

  @Get('rules/:pool')
  getRule(
    @Param('profileId', new ParseUUIDPipe()) profileId: string,
    @Param('pool', new ParseEnumPipe(VisibilityPool)) pool: VisibilityPool
  ) {
    return this.visibilityService.getRuleOrThrow(profileId, pool);
  }

  @Put('rules/:pool')
  upsertRule(
    @Param('profileId', new ParseUUIDPipe()) profileId: string,
    @Param('pool', new ParseEnumPipe(VisibilityPool)) pool: VisibilityPool,
    @Body() dto: UpsertVisibilityRuleDto
  ) {
    return this.visibilityService.upsertRule(profileId, pool, dto);
  }

  @Delete('rules/:pool')
  deleteRule(
    @Param('profileId', new ParseUUIDPipe()) profileId: string,
    @Param('pool', new ParseEnumPipe(VisibilityPool)) pool: VisibilityPool
  ) {
    return this.visibilityService.deleteRule(profileId, pool);
  }

  @Get('pools/:pool')
  getVisibleProfile(
    @Param('profileId', new ParseUUIDPipe()) profileId: string,
    @Param('pool', new ParseEnumPipe(VisibilityPool)) pool: VisibilityPool
  ) {
    return this.visibilityService.getVisibleProfile(profileId, pool);
  }
}
