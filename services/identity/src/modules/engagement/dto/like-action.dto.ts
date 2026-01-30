import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export enum LikeActionType {
  LIKE = 'like',
  PASS = 'pass',
  SAVE = 'save',
}

export class LikeActionDto {
  @IsUUID('4')
  senderId!: string;

  @IsUUID('4')
  receiverId!: string;

  @IsEnum(LikeActionType, { message: 'Action must be one of like, pass, save' })
  action!: LikeActionType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  highlight?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
