import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../prisma/client';
import { AuditActorType, AuditEntityType } from '../../../prisma/audit.stubs';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';
import { InitiateVerificationDto } from '../dto/initiate-verification.dto';
import { UserService } from '../../user/services/user.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';
// import { AuditService } from '../../audit/services/audit.service';

// Type stub - Verification table is in SQLite schema
type Verification = any;

interface ProviderDecisionInput {
  status: VerificationStatus;
  reference?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class VerificationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaClientLike,
    private readonly userService: UserService,
    private readonly auditService: AuditService
  ) {}

  async initiate(dto: InitiateVerificationDto): Promise<Verification> {
    const verification = await this.prisma.verification.create({
      data: {
        userId: dto.userId,
        provider: dto.kycProvider,
        status: dto.targetStatus ?? VerificationStatus.PENDING,
      },
    });

    await this.auditService.logVerificationInitiated(
      verification.userId,
      verification.id,
      dto.kycProvider,
      {
        actor: { type: AuditActorType.service, id: dto.kycProvider },
        entity: { type: AuditEntityType.verification, id: verification.id },
        channel: 'verification_service',
      }
    );

    return verification;
  }

  attachProviderReference(id: string, reference: string): Promise<Verification> {
    return this.updateOrThrow(id, { reference });
  }

  async complete(id: string): Promise<Verification> {
    return this.applyProviderDecision(id, { status: VerificationStatus.VERIFIED });
  }

  findById(id: string): Promise<Verification | null> {
    return this.prisma.verification.findUnique({ where: { id } });
  }

  async applyProviderDecision(id: string, input: ProviderDecisionInput): Promise<Verification> {
    const existing = await this.findOrThrow(id);
    const updated = await this.updateOrThrow(id, {
      status: input.status,
      reference: input.reference,
      metadata: input.metadata as
        | Prisma.InputJsonValue
        | Prisma.NullableJsonNullValueInput
        | undefined,
    });

    if (existing.status !== updated.status || input.metadata) {
      await this.auditService.logVerificationStatusChange(
        updated.userId,
        updated.id,
        existing.status,
        updated.status,
        input.metadata,
        {
          actor: { type: AuditActorType.service, id: input.reference ?? 'kyc_provider' },
          entity: { type: AuditEntityType.verification, id: updated.id },
          channel: 'verification_service',
        }
      );
    }

    if (input.status === VerificationStatus.VERIFIED) {
      await this.userService.markVerified(updated.userId);
    }

    return updated;
  }

  private async updateOrThrow(
    id: string,
    data: Prisma.VerificationUpdateInput
  ): Promise<Verification> {
    try {
      return await this.prisma.verification.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Verification ${id} not found`);
      }
      throw error;
    }
  }

  private async findOrThrow(id: string): Promise<Verification> {
    const record = await this.prisma.verification.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Verification ${id} not found`);
    }
    return record;
  }
}
