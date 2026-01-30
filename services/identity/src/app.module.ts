import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { VerificationModule } from './modules/verification/verification.module';
import { PolicyModule } from './modules/policy/policy.module';
import { KycModule } from './modules/kyc/kyc.module';
import { DeviceModule } from './modules/device/device.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './modules/home/home.module';
import { AuditModule } from './modules/audit/audit.module';
import { TrustModule } from './modules/trust/trust.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { MatchModule } from './modules/match/match.module';
import { AuthModule } from './modules/auth/auth.module';
import { EngagementModule } from './modules/engagement/engagement.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    ConfigModule,
    UserModule,
    AuditModule,
    VerificationModule,
    PolicyModule,
    KycModule,
    DeviceModule,
    HomeModule,
    TrustModule,
    AnalyticsModule,
    OnboardingModule,
    MatchModule,
    AuthModule,
    EngagementModule,
  ],
})
export class AppModule {}
