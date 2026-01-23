import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma, Profile, ProfileVersion } from '../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BootstrapProfileDto } from './dto/bootstrap-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async bootstrap(
    dto: BootstrapProfileDto
  ): Promise<{ profile: Profile; version: ProfileVersion }> {
    const existing = await this.prisma.profile.findUnique({ where: { userId: dto.userId } });
    if (existing) {
      throw new ConflictException('Profile already exists for this user');
    }

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          userId: dto.userId,
          handle: dto.handle ?? null,
          orientationVisibility: dto.orientationVisibility,
        },
      });

      const version = await tx.profileVersion.create({
        data: {
          profileId: profile.id,
          legalName: dto.legalName,
          displayName: dto.displayName,
          pronouns: dto.pronouns ?? null,
          bio: dto.bio ?? null,
          orientation: dto.orientation,
          lifestyleTags: dto.lifestyleTags ?? [],
          verifiedAt: dto.verifiedAt ? new Date(dto.verifiedAt) : null,
          metadata: this.buildVersionMetadata(dto),
          status: 'locked',
        },
      });

      await tx.profile.update({
        where: { id: profile.id },
        data: { currentVersionId: version.id },
      });

      return { profile: { ...profile, currentVersionId: version.id }, version };
    });
  }

  private buildVersionMetadata(dto: BootstrapProfileDto): Prisma.JsonObject {
    return {
      bootstrapSource: 'identity_onboarding',
      createdAt: new Date().toISOString(),
      ...(dto.handle ? { handle: dto.handle } : {}),
    };
  }
}
