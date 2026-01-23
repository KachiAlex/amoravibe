import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { MediaService } from './media.service';
import { RequestMediaUploadDto } from './dto/request-media-upload.dto';
import { CompleteMediaUploadDto } from './dto/complete-media-upload.dto';

@Controller('profiles/:profileId/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('uploads')
  requestUpload(
    @Param('profileId', new ParseUUIDPipe()) profileId: string,
    @Body() dto: RequestMediaUploadDto
  ) {
    return this.mediaService.requestUpload(profileId, dto);
  }

  @Post(':mediaId/complete')
  completeUpload(
    @Param('profileId', new ParseUUIDPipe()) profileId: string,
    @Param('mediaId', new ParseUUIDPipe()) mediaId: string,
    @Body() dto: CompleteMediaUploadDto
  ) {
    return this.mediaService.completeUpload(profileId, mediaId, dto);
  }
}
