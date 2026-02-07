import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { hashPassword, verifyPassword } from '../user/password.utils';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.resolveUser(dto);

    if (!user || !verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        isVerified: user.isVerified,
      },
      nextRoute: `/dashboard?userId=${user.id}`,
    };
  }

  async changePassword(dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!verifyPassword(dto.currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const hashed = hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { passwordHash: hashed },
    });

    return { success: true, message: 'Password updated' };
  }

  private async resolveUser(dto: LoginRequestDto) {
    const email = dto.email?.trim().toLowerCase();
    if (email) {
      return this.prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      });
    }

    const phone = dto.phone?.trim();
    if (phone) {
      return this.prisma.user.findFirst({ where: { phone } });
    }

    throw new BadRequestException('Provide an email or phone number.');
  }
}
