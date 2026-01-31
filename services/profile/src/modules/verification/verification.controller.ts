import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { EmailService } from '../email/email.service';
import { VerificationMethod } from '@prisma/client';

class SendCodeDto {
  email?: string;
  phone?: string;
  method: 'email' | 'sms';
}

class VerifyCodeDto {
  email?: string;
  phone?: string;
  code: string;
}

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly emailService: EmailService
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendCode(@Body() { email, phone, method }: SendCodeDto) {
    if (!email && !phone) {
      throw new Error('Email or phone number is required');
    }

    const verification = await this.verificationService.createVerificationCode(
      email,
      phone,
      method as VerificationMethod
    );

    // Send the code via the selected method
    if (method === 'email' && email) {
      await this.emailService.sendVerificationEmail(email, verification.code);
    } else if (method === 'sms' && phone) {
      // TODO: Implement SMS sending
      console.log(`SMS verification code: ${verification.code}`);
    }

    return { success: true, message: 'Verification code sent' };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() { email, phone, code }: VerifyCodeDto) {
    if (!email && !phone) {
      throw new Error('Email or phone number is required');
    }

    const isValid = await this.verificationService.verifyCode(code, email, phone);

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid or expired verification code',
      };
    }

    return {
      success: true,
      message: 'Verification successful',
      verified: true,
    };
  }

  @Post('check')
  @HttpCode(HttpStatus.OK)
  async checkVerification(@Body() { email, phone }: { email?: string; phone?: string }) {
    const isVerified = await this.verificationService.isVerified({ email, phone });
    return { verified: isVerified };
  }
}
