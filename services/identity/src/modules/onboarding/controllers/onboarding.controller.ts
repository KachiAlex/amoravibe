import { Body, Controller, Post } from '@nestjs/common';
import { OnboardingService } from '../services/onboarding.service';
import { OnboardingSubmissionDto } from '../dto/onboarding-submission.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  submit(@Body() dto: OnboardingSubmissionDto) {
    return this.onboardingService.submit(dto);
  }
}
