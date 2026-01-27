import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class MatchQueryDto {
  @IsUUID('4')
  userId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
