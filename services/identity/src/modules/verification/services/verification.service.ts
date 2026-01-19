import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Verification } from '@prisma/client';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';
import { InitiateVerificationDto } from '../dto/initiate-verification.dto';
import { UserService } from '../../user/services/user.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';

interface ProviderDecisionInput {
  status: VerificationStatus;
  reference?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class VerificationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaClientLike,
    private readonly userService: UserService
  ) {}

  initiate(dto: InitiateVerificationDto): Promise<Verification> {
    return this.prisma.verification.create({
      data: {
        userId: dto.userId,
        provider: dto.kycProvider,
        status: dto.targetStatus ?? VerificationStatus.PENDING,
      },
    });
  }

  async complete(id: string): Promise<Verification> {
    return this.applyProviderDecision(id, { status: VerificationStatus.VERIFIED });
  }

  findById(id: string): Promise<Verification | null> {
    return this.prisma.verification.findUnique({ where: { id } });
  }

  async applyProviderDecision(id: string, input: ProviderDecisionInput): Promise<Verification> {
    const updated = await this.updateOrThrow(id, {
      status: input.status,
      reference: input.reference,
      metadata: input.metadata as
        | Prisma.InputJsonValue
        | Prisma.NullableJsonNullValueInput
        | undefined,
    });

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
}
