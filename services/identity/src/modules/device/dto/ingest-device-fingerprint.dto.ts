import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class IngestDeviceFingerprintDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  hash!: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsObject()
  signals?: Record<string, unknown>;
}
