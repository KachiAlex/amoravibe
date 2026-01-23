import { VisibilityPool, Orientation } from '../../../prisma/client';
import {
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class BootstrapProfileDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @Matches(/^[a-z0-9_]{3,30}$/i)
  handle?: string;

  @IsString()
  @MinLength(2)
  legalName!: string;

  @IsString()
  @MinLength(2)
  displayName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  pronouns?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsEnum(Orientation)
  orientation!: Orientation;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  lifestyleTags?: string[];

  @IsOptional()
  @IsEnum(VisibilityPool)
  orientationVisibility: VisibilityPool = VisibilityPool.hetero;

  @IsOptional()
  @IsString()
  verifiedAt?: string;
}
