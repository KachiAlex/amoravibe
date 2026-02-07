import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { PoolAccessRequestDto } from '../dto/pool-access-request.dto';
import { OrientationPolicyService } from '../services/orientation-policy.service';
import { UserService } from '../../user/services/user.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditActorType, AuditEntityType } from '../../../prisma/audit.stubs';
import { Orientation } from '../../../common/enums/orientation.enum';

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
      userOrientation: user.orientation as Orientation,
      verified: user.isVerified,
    });

    if (!decision.allowed) {
      await this.auditService.logOrientationPoolDenied(
        user.id,
        dto.requestedPool,
        decision.reason ?? 'Access denied by policy',
        {
          actor: { type: AuditActorType.admin, id: 'policy_engine' },
          entity: { type: AuditEntityType.user, id: user.id },
          channel: 'orientation_policy',
        }
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
