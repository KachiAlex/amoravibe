import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  RiskSignalChannel,
  RiskSignalSeverity,
  RiskSignalType,
} from '../../../common/enums/risk.enums';

class RiskSignalFeatureDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsOptional()
  value?: unknown;
}

export class CreateRiskSignalDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  relatedUserId?: string;

  @IsOptional()
  @IsUUID()
  deviceFingerprintId?: string;

  @IsEnum(RiskSignalType)
  type!: RiskSignalType;

  @IsEnum(RiskSignalChannel)
  channel!: RiskSignalChannel;

  @IsEnum(RiskSignalSeverity)
  severity!: RiskSignalSeverity;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RiskSignalFeatureDto)
  features?: RiskSignalFeatureDto[];

  @IsOptional()
  @IsNumber()
  score?: number;
}
