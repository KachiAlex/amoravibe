import { Module } from '@nestjs/common';
import { OrientationPolicyService } from './services/orientation-policy.service';

@Module({
  providers: [OrientationPolicyService],
  exports: [OrientationPolicyService],
})
export class PolicyModule {}
