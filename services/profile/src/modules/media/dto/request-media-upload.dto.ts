import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ProfileMediaType } from '../../../common/enums/profile-media-type.enum';
import { VisibilityPool } from '../../../common/enums/visibility-pool.enum';

export class RequestMediaUploadDto {
  @IsEnum(ProfileMediaType)
  type!: ProfileMediaType;

  @IsEnum(VisibilityPool)
  visibility!: VisibilityPool;

  @IsString()
  @MaxLength(64)
  contentType!: string;

  @IsString()
  @Matches(/^\.[a-z0-9]{2,6}$/i, {
    message: 'fileExtension must include a leading dot and 2-6 alphanumeric chars',
  })
  fileExtension!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  label?: string;
}
