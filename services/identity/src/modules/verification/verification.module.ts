import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { VerificationController } from './controllers/verification.controller';
import { VerificationService } from './services/verification.service';

@Module({
  imports: [UserModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
