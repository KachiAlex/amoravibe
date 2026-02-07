import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TrustSignalsService } from './services/trust-signals.service';
import { RiskProfileService } from './services/risk-profile.service';
import { TrustCenterService } from './services/trust-center.service';
import { CreateRiskSignalDto } from './dto/create-risk-signal.dto';

@Controller('trust')
export class TrustController {
  constructor(
    private readonly trustSignals: TrustSignalsService,
    private readonly riskProfiles: RiskProfileService,
    private readonly trustCenter: TrustCenterService
  ) {}

  @Post('signals')
  createSignal(@Body() dto: CreateRiskSignalDto) {
    return this.trustSignals.ingestSignal(dto);
  }

  @Get('signals/user/:userId')
  getSignalsForUser(@Param('userId') userId: string) {
    return this.trustSignals.listForUser(userId);
  }

  @Get('profiles/:userId')
  getProfile(@Param('userId') userId: string) {
    return this.riskProfiles.getProfile(userId);
  }

  @Get('center/:userId')
  getTrustCenterSnapshot(@Param('userId') userId: string) {
    return this.trustCenter.getSnapshot(userId);
  }
}
