import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePurgeRequestDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
