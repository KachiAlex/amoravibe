import { IsBoolean, IsUUID } from 'class-validator';

export class NotificationToggleDto {
  @IsUUID('4')
  userId!: string;

  @IsBoolean()
  enabled!: boolean;
}
