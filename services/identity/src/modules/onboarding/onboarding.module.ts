import { Module } from '@nestjs/common';
import { OnboardingController } from './controllers/onboarding.controller';
import { OnboardingService } from './services/onboarding.service';
import { UserModule } from '../user/user.module';
import { VerificationModule } from '../verification/verification.module';
import { ConfigModule } from '../../config/config.module';
import { KycModule } from '../kyc/kyc.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, UserModule, VerificationModule, ConfigModule, KycModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
