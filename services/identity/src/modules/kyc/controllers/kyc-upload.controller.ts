import { Body, Controller, Post } from '@nestjs/common';
import { KycUploadService } from '../services/kyc-upload.service';
import { GenerateKycUploadDto } from '../dto/generate-kyc-upload.dto';

@Controller('kyc/uploads')
export class KycUploadController {
  constructor(private readonly uploadService: KycUploadService) {}

  @Post()
  generateUpload(@Body() dto: GenerateKycUploadDto) {
    return this.uploadService.generate(dto);
  }
}
