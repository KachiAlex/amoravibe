import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpsertVisibilityRuleDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visibleFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visibleMediaIds?: string[];
}
