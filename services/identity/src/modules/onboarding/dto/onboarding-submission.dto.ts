import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class OnboardingSubmissionDto extends CreateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  legalLastName?: string;
}
