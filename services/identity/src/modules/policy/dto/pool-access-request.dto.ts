import { IsEnum, IsUUID } from 'class-validator';
import { Orientation } from '../../../common/enums/orientation.enum';

export class PoolAccessRequestDto {
  @IsUUID()
  userId!: string;

  @IsEnum(Orientation)
  requestedPool!: Orientation;
}
