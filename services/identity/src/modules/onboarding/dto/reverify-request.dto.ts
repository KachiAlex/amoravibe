import { IsUUID } from 'class-validator';

export class ReverifyRequestDto {
  @IsUUID()
  userId!: string;
}
