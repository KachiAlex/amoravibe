import { IsEnum, IsString, IsUUID } from 'class-validator';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';

export class InitiateVerificationDto {
  @IsUUID()
  userId!: string;

  @IsEnum(VerificationStatus)
  targetStatus: VerificationStatus = VerificationStatus.PENDING;

  @IsString()
  kycProvider: string = 'manual_review';
}
