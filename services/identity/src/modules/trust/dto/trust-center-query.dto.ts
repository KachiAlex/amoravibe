import { IsUUID } from 'class-validator';

export class TrustCenterQueryDto {
  @IsUUID()
  userId!: string;
}
