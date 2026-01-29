import { IsEmail, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';

export class LoginRequestDto {
  @ValidateIf((dto) => !dto.phone)
  @IsOptional()
  @IsEmail()
  email?: string;

  @ValidateIf((dto) => !dto.email)
  @IsOptional()
  @IsString()
  @Matches(/^[+]?[0-9\s-]{6,}$/)
  phone?: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
