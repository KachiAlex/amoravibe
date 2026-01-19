import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { VerificationModule } from './modules/verification/verification.module';
import { PolicyModule } from './modules/policy/policy.module';
import { KycModule } from './modules/kyc/kyc.module';
import { DeviceModule } from './modules/device/device.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './modules/home/home.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    UserModule,
    VerificationModule,
    PolicyModule,
    KycModule,
    DeviceModule,
    HomeModule,
  ],
})
export class AppModule {}
