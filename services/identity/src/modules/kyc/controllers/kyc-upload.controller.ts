import { Body, Controller, Inject, Post } from '@nestjs/common';
import { GenerateKycUploadDto } from '../dto/generate-kyc-upload.dto';
import { KycProvider } from '../interfaces/kyc-provider.interface';
import { KYC_PROVIDER_TOKEN } from '../kyc.constants';

@Controller('kyc/uploads')
export class KycUploadController {
  constructor(@Inject(KYC_PROVIDER_TOKEN) private readonly provider: KycProvider) {}

  @Post()
  generateUpload(@Body() dto: GenerateKycUploadDto) {
    return this.provider.getUploadTarget(dto);
  }
}
