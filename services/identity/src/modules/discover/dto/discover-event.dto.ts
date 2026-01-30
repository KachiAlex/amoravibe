import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { DiscoverEventAction } from '../../../prisma/client';
import { DiscoverFeedMode } from './discover-feed.dto';

export class DiscoverEventDto {
  @IsUUID()
  userId!: string;

  @IsEnum(DiscoverEventAction)
  action!: DiscoverEventAction;

  @IsOptional()
  @IsUUID()
  cardUserId?: string;

  @IsOptional()
  @IsString()
  surface?: string;

  @IsOptional()
  @IsEnum(['default', 'verified', 'nearby', 'fresh', 'premium', 'shared'], {
    message: 'filter must be a valid discover mode',
  })
  filter?: DiscoverFeedMode;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(60000)
  latencyMs?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
