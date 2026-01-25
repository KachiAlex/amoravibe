import { IsOptional, IsUUID, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class ExportPayloadDto {
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}

export class CreateExportRequestDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportPayloadDto)
  payload?: ExportPayloadDto;
}
