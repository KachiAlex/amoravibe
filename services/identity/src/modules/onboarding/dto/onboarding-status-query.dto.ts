import { IsUUID } from 'class-validator';

export class OnboardingStatusQueryDto {
  @IsUUID()
  userId!: string;
}
