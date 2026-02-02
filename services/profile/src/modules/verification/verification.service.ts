import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VerificationMethod } from '../../prisma/client';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  private generateCode(length = 6): string {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .substring(0, length);
  }

  async createVerificationCode(
    email?: string,
    phone?: string,
    method: VerificationMethod = VerificationMethod.email
  ) {
    if (!email && !phone) {
      throw new Error('Either email or phone must be provided');
    }

    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiration

    // Invalidate any existing codes
    await this.prisma.verificationCode.updateMany({
      where: {
        OR: [{ email }, { phone }],
        verified: false,
        expiresAt: { gt: new Date() },
      },
      data: { expiresAt: new Date() }, // Expire existing codes
    });

    return this.prisma.verificationCode.create({
      data: {
        email: email?.toLowerCase(),
        phone,
        code,
        method,
        expiresAt,
      },
    });
  }

  async verifyCode(code: string, email?: string, phone?: string) {
    if (!email && !phone) {
      throw new Error('Either email or phone must be provided');
    }

    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        code,
        OR: [{ email: email?.toLowerCase() }, { phone }],
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new Error('Invalid or expired verification code');
    }

    // Mark as verified
    await this.prisma.verificationCode.update({
      where: { id: verification.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    return true;
  }

  async isVerified(identifier: { email?: string; phone?: string }) {
    if (!identifier.email && !identifier.phone) {
      return false;
    }

    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        ...(identifier.email && { email: identifier.email.toLowerCase() }),
        ...(identifier.phone && { phone: identifier.phone }),
        verified: true,
      },
      orderBy: { verifiedAt: 'desc' },
    });

    return !!verification;
  }
}
