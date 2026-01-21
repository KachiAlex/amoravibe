import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export enum KycUploadPurpose {
  DOCUMENT = 'document',
  SELFIE = 'selfie',
  PROOF_OF_ADDRESS = 'proof_of_address',
}

export class GenerateKycUploadDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  verificationId!: string;

  @IsEnum(KycUploadPurpose)
  purpose!: KycUploadPurpose;

  @IsString()
  @Matches(/^[\w.+-]{1,10}$/)
  fileExtension!: string;

  @IsString()
  contentType!: string;

  @IsOptional()
  @IsString()
  label?: string;
}
