import { Module } from '@nestjs/common';
import { OrientationPolicyService } from './services/orientation-policy.service';
import { PoolAccessController } from './controllers/pool-access.controller';
import { UserModule } from '../user/user.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UserModule, AuditModule],
  controllers: [PoolAccessController],
  providers: [OrientationPolicyService],
  exports: [OrientationPolicyService],
})
export class PolicyModule {}
