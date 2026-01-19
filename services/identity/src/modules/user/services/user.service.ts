import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PrismaClientLike } from '../../../prisma/prisma.types';
import { UserProfile } from '../user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async create(dto: CreateUserDto): Promise<UserProfile> {
    return this.prisma.user.create({
      data: {
        legalName: dto.legalName,
        displayName: dto.displayName,
        email: dto.email,
        gender: dto.gender,
        orientation: dto.orientation,
      },
    });
  }

  findById(id: string): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  markVerified(id: string): Promise<UserProfile> {
    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }
}
