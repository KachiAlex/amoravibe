import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OnboardingService } from '../services/onboarding.service';
import { OnboardingSubmissionDto } from '../dto/onboarding-submission.dto';
import { OnboardingStatusQueryDto } from '../dto/onboarding-status-query.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  submit(@Body() dto: OnboardingSubmissionDto) {
    return this.onboardingService.submit(dto);
  }

  @Get('status')
  status(@Query() query: OnboardingStatusQueryDto) {
    return this.onboardingService.getStatus(query.userId);
  }
}
