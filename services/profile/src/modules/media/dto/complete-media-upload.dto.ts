import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteMediaUploadDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  checksum?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  moderationContext?: string;
}
