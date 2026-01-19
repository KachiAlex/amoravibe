import { Gender } from '../../../common/enums/gender.enum';
import { Orientation } from '../../../common/enums/orientation.enum';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  legalName!: string;

  @IsString()
  @MinLength(2)
  displayName!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsEnum(Orientation)
  orientation!: Orientation;
}
