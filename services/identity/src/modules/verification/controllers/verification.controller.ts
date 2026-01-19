import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { VerificationService } from '../services/verification.service';
import { InitiateVerificationDto } from '../dto/initiate-verification.dto';

@Controller('verifications')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  initiate(@Body() dto: InitiateVerificationDto) {
    return this.verificationService.initiate(dto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.verificationService.complete(id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.verificationService.findById(id);
  }
}
