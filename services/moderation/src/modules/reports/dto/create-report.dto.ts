import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportChannel } from '../../../common/enums/moderation.enums';

export class CreateReportDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsUUID()
  reporterUserId?: string;

  @IsOptional()
  @IsUUID()
  reportedUserId?: string;

  @IsEnum(ReportChannel)
  @IsOptional()
  channel: ReportChannel = ReportChannel.IN_APP;

  @IsNotEmpty()
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  evidence?: Record<string, unknown>;
}
