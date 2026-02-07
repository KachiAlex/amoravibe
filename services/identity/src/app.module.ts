import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { DevModule } from './modules/dev/dev.module';
// All other modules disabled due to complex PostgreSQL/full schema dependencies
// import { VerificationModule } from './modules/verification/verification.module';
// import { PolicyModule } from './modules/policy/policy.module';
// import { KycModule } from './modules/kyc/kyc.module';
// import { DeviceModule } from './modules/device/device.module';
// import { HomeModule } from './modules/home/home.module';
// import { AuditModule } from './modules/audit/audit.module';
// import { TrustModule } from './modules/trust/trust.module';
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { OnboardingModule } from './modules/onboarding/onboarding.module';
// import { MatchModule } from './modules/match/match.module';
// import { MatchesModule } from './modules/matches/matches.module';
// import { AuthModule } from './modules/auth/auth.module';
// import { EngagementModule } from './modules/engagement/engagement.module';
// import { DiscoverModule } from './modules/discover/discover.module';
// import { MessagingModule } from './modules/messaging/messaging.module';
// import { CommunitiesModule } from './modules/communities/communities.module';
// import { ProfileModule } from './modules/profile/profile.module';
// import { SettingsModule } from './modules/settings/settings.module';
// import { SafetyModule } from './modules/safety/safety.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    ConfigModule,
    UserModule,
    DevModule,
  ],
})
export class AppModule {}
