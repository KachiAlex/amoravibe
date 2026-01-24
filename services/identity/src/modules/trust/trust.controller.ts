import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { TrustSignalsService } from './services/trust-signals.service';
import { RiskProfileService } from './services/risk-profile.service';
import { CreateRiskSignalDto } from './dto/create-risk-signal.dto';

@Controller('trust')
export class TrustController {
  constructor(
    private readonly trustSignals: TrustSignalsService,
    private readonly riskProfiles: RiskProfileService
  ) {}

  @Post('signals')
  createSignal(@Body() dto: CreateRiskSignalDto) {
    return this.trustSignals.ingestSignal(dto);
  }

  @Get('signals/user/:userId')
  getSignalsForUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.trustSignals.listForUser(userId);
  }

  @Get('profiles/:userId')
  getProfile(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.riskProfiles.getProfile(userId);
  }
}
