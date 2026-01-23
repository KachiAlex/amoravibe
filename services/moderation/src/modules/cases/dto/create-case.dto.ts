import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import {
  ModerationCaseStatus,
  ModerationSeverity,
  ModerationSource,
} from '../../../common/enums/moderation.enums';

export class CreateCaseDto {
  @IsEnum(ModerationSeverity)
  @IsOptional()
  severity?: ModerationSeverity = ModerationSeverity.MEDIUM;

  @IsEnum(ModerationSource)
  @IsOptional()
  source?: ModerationSource = ModerationSource.USER_REPORT;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(180)
  summary!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  reporterUserId?: string;

  @IsOptional()
  @IsUUID()
  reportedUserId?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdateCaseStatusDto {
  @IsEnum(ModerationCaseStatus)
  status!: ModerationCaseStatus;

  @IsOptional()
  @IsEnum(ModerationSeverity)
  severity?: ModerationSeverity;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AddCaseNoteDto {
  @IsNotEmpty()
  @IsString()
  note!: string;

  @IsOptional()
  @IsUUID()
  actorId?: string;
}

export class CaseQueryDto {
  @IsOptional()
  @IsEnum(ModerationCaseStatus)
  status?: ModerationCaseStatus;

  @IsOptional()
  @IsEnum(ModerationSeverity)
  severity?: ModerationSeverity;

  @IsOptional()
  @IsUUID()
  reportedUserId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
