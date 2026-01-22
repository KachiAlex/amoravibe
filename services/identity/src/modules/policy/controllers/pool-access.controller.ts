import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { PoolAccessRequestDto } from '../dto/pool-access-request.dto';
import { OrientationPolicyService } from '../services/orientation-policy.service';
import { UserService } from '../../user/services/user.service';
import { AuditService } from '../../audit/services/audit.service';

@Controller('policy/pools')
export class PoolAccessController {
  constructor(
    private readonly users: UserService,
    private readonly policy: OrientationPolicyService,
    private readonly auditService: AuditService
  ) {}

  @Post('access')
  async evaluate(@Body() dto: PoolAccessRequestDto) {
    const user = await this.users.findById(dto.userId);
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    const decision = this.policy.evaluateAccess({
      requestedPool: dto.requestedPool,
      userOrientation: user.orientation,
      verified: user.isVerified,
    });

    if (!decision.allowed) {
      await this.auditService.logOrientationPoolDenied(
        user.id,
        dto.requestedPool,
        decision.reason ?? 'Access denied by policy'
      );
    }

    return {
      allowed: decision.allowed,
      reason: decision.reason,
      verificationRequired: !user.isVerified,
      context: {
        requestedPool: dto.requestedPool,
        userOrientation: user.orientation,
        verified: user.isVerified,
      },
    };
  }
}
