import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface PublicProfilePayload {
  id: string;
  displayName: string;
  bio?: string | null;
  location?: string | null;
  photos: string[];
  isVerified: boolean;
  createdAt: Date;
}

interface PrivateProfilePayload {
  genderIdentity?: string | null;
  sexualOrientation?: string | null;
  pronouns?: string | null;
  relationshipGoal?: string | null;
  lastIdentityUpdateAt?: Date;
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicProfile(userId: string): Promise<PublicProfilePayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        bio: true,
        city: true,
        cityRegion: true,
        cityCountry: true,
        isVerified: true,
        createdAt: true,
        photos: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.buildPublicProfile(user);
  }

  async updatePublicProfile(userId: string, updates: {
    displayName?: string;
    bio?: string;
    location?: string;
  }): Promise<PublicProfilePayload> {
    const data: Prisma.UserUpdateInput = {};

    if (updates.displayName !== undefined) {
      data.displayName = updates.displayName;
    }
    if (updates.bio !== undefined) {
      data.bio = updates.bio;
    }
    if (updates.location !== undefined) {
      data.city = updates.location;
    }

    await this.prisma.user.update({ where: { id: userId }, data });
    return this.getPublicProfile(userId);
  }

  async getPrivateProfile(userId: string): Promise<PrivateProfilePayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profileDetail: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const detail = user.profileDetail;
    return {
      genderIdentity: detail?.genderIdentity ?? null,
      sexualOrientation: detail?.sexualOrientation ?? null,
      pronouns: detail?.pronouns ?? null,
      relationshipGoal: detail?.relationshipGoal ?? null,
      lastIdentityUpdateAt: detail?.updatedAt ?? user.updatedAt,
    };
  }

  async updatePrivateProfile(userId: string, updates: {
    genderIdentity?: string;
    sexualOrientation?: string;
    pronouns?: string;
    relationshipGoal?: string;
  }): Promise<PrivateProfilePayload> {
    const createPayload: Prisma.UserProfileDetailCreateInput = {
      user: { connect: { id: userId } },
      genderIdentity: updates.genderIdentity ?? null,
      sexualOrientation: updates.sexualOrientation ?? null,
      pronouns: updates.pronouns ?? null,
      relationshipGoal: updates.relationshipGoal ?? null,
    };

    const updatePayload: Prisma.UserProfileDetailUpdateInput = {};

    if (updates.genderIdentity !== undefined) {
      updatePayload.genderIdentity = updates.genderIdentity;
    }
    if (updates.sexualOrientation !== undefined) {
      updatePayload.sexualOrientation = updates.sexualOrientation;
    }
    if (updates.pronouns !== undefined) {
      updatePayload.pronouns = updates.pronouns;
    }
    if (updates.relationshipGoal !== undefined) {
      updatePayload.relationshipGoal = updates.relationshipGoal;
    }

    await this.prisma.userProfileDetail.upsert({
      where: { userId },
      create: createPayload,
      update: updatePayload,
    });

    return this.getPrivateProfile(userId);
  }

  private buildPublicProfile(user: Prisma.UserGetPayload<{ select: {
    id: true;
    displayName: true;
    bio: true;
    city: true;
    cityRegion: true;
    cityCountry: true;
    isVerified: true;
    createdAt: true;
    photos: true;
  } }>): PublicProfilePayload {
    const location = [user.city, user.cityRegion, user.cityCountry].filter(Boolean).join(', ');
    const photos = Array.isArray(user.photos) ? (user.photos as string[]) : [];

    return {
      id: user.id,
      displayName: user.displayName,
      bio: user.bio,
      location: location || null,
      photos,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}
