import { Gender } from '../../../common/enums/gender.enum';
import { Orientation } from '../../../common/enums/orientation.enum';
import { DiscoverySpace } from '../../../common/enums/discovery-space.enum';
import { MatchPreference } from '../../../common/enums/match-preference.enum';
import { VerificationIntent } from '../../../common/enums/verification-intent.enum';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  legalName!: string;

  @IsString()
  @MinLength(2)
  displayName!: string;

  @IsISO8601()
  dateOfBirth!: string;

  @ValidateIf((dto) => !dto.phone)
  @IsOptional()
  @IsEmail()
  email?: string;

  @ValidateIf((dto) => !dto.email)
  @IsOptional()
  @IsString()
  @Matches(/^[+]?\d[\d\s-]{6,}$/)
  phone?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsEnum(Orientation)
  orientation!: Orientation;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(Orientation, { each: true })
  orientationPreferences!: Orientation[];

  @IsEnum(DiscoverySpace)
  discoverySpace!: DiscoverySpace;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(MatchPreference, { each: true })
  matchPreferences!: MatchPreference[];

  @IsString()
  @MinLength(2)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  photos!: string[];

  @IsEnum(VerificationIntent)
  verificationIntent!: VerificationIntent;
}
