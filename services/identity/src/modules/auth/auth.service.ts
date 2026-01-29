import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { verifyPassword } from '../user/password.utils';

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

  private resolveIdentifier(dto: LoginRequestDto) {
    if (dto.email) {
      return { email: dto.email.toLowerCase() };
    }
    if (dto.phone) {
      return { phone: dto.phone };
    }
    throw new BadRequestException('Provide an email or phone number.');
  }

  private async resolveUser(dto: LoginRequestDto) {
    const identifier = this.resolveIdentifier(dto);
    return this.prisma.user.findUnique({ where: identifier });
  }
}
