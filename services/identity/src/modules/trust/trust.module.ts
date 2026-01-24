import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';
import { TrustController } from './trust.controller';
import { TrustSignalsService } from './services/trust-signals.service';
import { RiskScoringService } from './services/risk-scoring.service';
import { TrustModelService } from './services/trust-model.service';
import { RiskProfileService } from './services/risk-profile.service';
import { TrustFeatureService } from './services/trust-feature.service';
import { TrustCronService } from './services/trust-cron.service';
import { ModerationAutomationService } from './services/moderation-automation.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [TrustController],
  providers: [
    TrustSignalsService,
    RiskScoringService,
    TrustModelService,
    RiskProfileService,
    TrustFeatureService,
    TrustCronService,
    ModerationAutomationService,
  ],
  exports: [TrustSignalsService, RiskProfileService],
})
export class TrustModule {}
