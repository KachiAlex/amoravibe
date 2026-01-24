import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  AutomationActionType,
  AutomationTriggerType,
} from '../../../common/enums/moderation.enums';

export interface AutomationActionConfig {
  type: AutomationActionType;
  params?: Record<string, unknown>;
}

export class AutomationActionConfigDto implements AutomationActionConfig {
  @IsEnum(AutomationActionType)
  type!: AutomationActionType;

  @IsOptional()
  params?: Record<string, unknown>;
}

export class CreateAutomationRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AutomationTriggerType)
  trigger!: AutomationTriggerType;

  @IsOptional()
  @IsBoolean()
  active?: boolean = true;

  @IsOptional()
  conditions?: Record<string, unknown>;

  @ValidateNested()
  @Type(() => AutomationActionConfigDto)
  action!: AutomationActionConfigDto;
}

export class UpdateAutomationRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AutomationTriggerType)
  trigger?: AutomationTriggerType;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => AutomationActionConfigDto)
  action?: AutomationActionConfigDto;
}

export class RunAutomationDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  context?: Record<string, unknown>;
}
