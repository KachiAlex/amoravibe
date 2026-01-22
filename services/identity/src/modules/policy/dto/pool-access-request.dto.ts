import { IsEnum, IsUUID } from 'class-validator';
import { DiscoverySpace } from '../../../common/enums/discovery-space.enum';

export class PoolAccessRequestDto {
  @IsUUID()
  userId!: string;

  @IsEnum(DiscoverySpace)
  requestedPool!: DiscoverySpace;
}
