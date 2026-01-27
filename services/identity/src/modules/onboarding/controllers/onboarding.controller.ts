import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OnboardingService } from '../services/onboarding.service';
import { OnboardingSubmissionDto } from '../dto/onboarding-submission.dto';
import { OnboardingStatusQueryDto } from '../dto/onboarding-status-query.dto';
import { ReverifyRequestDto } from '../dto/reverify-request.dto';

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

  @Post('reverify')
  reverify(@Body() dto: ReverifyRequestDto) {
    return this.onboardingService.reverify(dto.userId);
  }
}
