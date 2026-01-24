import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { AutomationService } from './automation.service';
import {
  CreateAutomationRuleDto,
  RunAutomationDto,
  UpdateAutomationRuleDto,
} from './dto/automation-rule.dto';
import { AutomationTriggerType } from '../../common/enums/moderation.enums';

@Controller('automation')
export class AutomationController {
  constructor(private readonly automation: AutomationService) {}

  @Post('rules')
  createRule(@Body() dto: CreateAutomationRuleDto) {
    return this.automation.createRule(dto);
  }

  @Get('rules')
  listRules() {
    return this.automation.listRules();
  }

  @Get('rules/:id')
  getRule(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.automation.getRule(id);
  }

  @Patch('rules/:id')
  updateRule(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAutomationRuleDto) {
    return this.automation.updateRule(id, dto);
  }

  @Delete('rules/:id')
  deleteRule(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.automation.deleteRule(id);
  }

  @Post('rules/:id/run')
  runRule(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: RunAutomationDto) {
    return this.automation.runRule(id, dto);
  }

  @Post('trigger/:type')
  triggerByType(@Param('type') type: AutomationTriggerType, @Body() dto: RunAutomationDto) {
    return this.automation.triggerRules(type, dto);
  }
}
