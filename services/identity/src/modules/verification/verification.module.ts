import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuditModule } from '../audit/audit.module';
import { VerificationController } from './controllers/verification.controller';
import { VerificationService } from './services/verification.service';

@Module({
  imports: [UserModule, AuditModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
