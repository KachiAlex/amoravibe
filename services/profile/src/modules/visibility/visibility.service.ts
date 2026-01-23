import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  Profile,
  ProfileMedia,
  ProfileMediaStatus as PrismaProfileMediaStatus,
  ProfileMediaType,
  ProfileVersion,
  ProfileVisibilityRule,
  VisibilityPool as PrismaVisibilityPool,
} from '../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VisibilityPool } from '../../common/enums/visibility-pool.enum';
import { UpsertVisibilityRuleDto } from './dto/upsert-visibility-rule.dto';
import { ProfileMediaStatus as MediaStatusEnum } from '../../common/enums/profile-media-status.enum';

export interface VisibleMediaSummary {
  id: string;
  type: ProfileMediaType;
  visibility: PrismaVisibilityPool;
  status: PrismaProfileMediaStatus;
  label?: string | null;
}

export interface VisibleProfilePayload {
  profileId: string;
  userId: string;
  pool: VisibilityPool;
  fields: Record<string, unknown>;
  media: VisibleMediaSummary[];
}

const DEFAULT_VISIBLE_FIELDS = [
  'displayName',
  'pronouns',
  'bio',
  'orientation',
  'lifestyleTags',
  'handle',
];

@Injectable()
export class VisibilityService {
  constructor(private readonly prisma: PrismaService) {}

  listRules(profileId: string) {
    return this.prisma.profileVisibilityRule.findMany({
      where: { profileId },
      orderBy: { pool: 'asc' },
    });
  }

  async getRule(profileId: string, pool: VisibilityPool) {
    return this.prisma.profileVisibilityRule.findUnique({
      where: { profileId_pool: { profileId, pool: pool as PrismaVisibilityPool } },
    });
  }

  async getRuleOrThrow(profileId: string, pool: VisibilityPool) {
    const rule = await this.getRule(profileId, pool);
    if (!rule) {
      throw new NotFoundException(`No visibility rule for pool ${pool}`);
    }
    return rule;
  }

  async upsertRule(profileId: string, pool: VisibilityPool, dto: UpsertVisibilityRuleDto) {
    await this.assertProfile(profileId);
    return this.prisma.profileVisibilityRule.upsert({
      where: { profileId_pool: { profileId, pool: pool as PrismaVisibilityPool } },
      update: {
        visibleFields: dto.visibleFields ?? Prisma.DbNull,
        visibleMediaIds: dto.visibleMediaIds ?? Prisma.DbNull,
      },
      create: {
        profileId,
        pool: pool as PrismaVisibilityPool,
        visibleFields: dto.visibleFields ?? Prisma.DbNull,
        visibleMediaIds: dto.visibleMediaIds ?? Prisma.DbNull,
      },
    });
  }

  async deleteRule(profileId: string, pool: VisibilityPool) {
    try {
      return await this.prisma.profileVisibilityRule.delete({
        where: { profileId_pool: { profileId, pool: pool as PrismaVisibilityPool } },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`No visibility rule for pool ${pool}`);
      }
      throw error;
    }
  }

  async getVisibleProfile(profileId: string, pool: VisibilityPool) {
    const { profile, version } = await this.fetchProfileAndVersion(profileId);
    const media = await this.prisma.profileMedia.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
    });
    const rule = await this.getRule(profileId, pool);

    return this.buildVisibleProfilePayload({
      profile,
      version,
      media,
      pool,
      rule: rule ?? undefined,
    });
  }

  buildVisibleProfilePayload(args: {
    profile: Profile;
    version: ProfileVersion;
    media: ProfileMedia[];
    pool: VisibilityPool;
    rule?: ProfileVisibilityRule | null;
  }): VisibleProfilePayload {
    const { profile, version, media, pool, rule } = args;
    const fields = this.extractFields(version, rule?.visibleFields as string[] | undefined);
    const mediaSummaries = this.filterMedia(
      media,
      pool,
      rule?.visibleMediaIds as string[] | undefined
    );

    return {
      profileId: profile.id,
      userId: profile.userId,
      pool,
      fields,
      media: mediaSummaries,
    };
  }

  private extractFields(version: ProfileVersion, allowed?: string[]) {
    const fieldKeys = allowed && allowed.length > 0 ? allowed : DEFAULT_VISIBLE_FIELDS;
    return fieldKeys.reduce<Record<string, unknown>>((acc, key) => {
      if (key in version) {
        acc[key] = (version as Record<string, unknown>)[key];
      }
      return acc;
    }, {});
  }

  private filterMedia(media: ProfileMedia[], pool: VisibilityPool, allowedIds?: string[]) {
    const normalizedPool = pool as PrismaVisibilityPool;
    const eligible = media.filter((item) => {
      if (item.status !== (MediaStatusEnum.APPROVED as PrismaProfileMediaStatus)) {
        return false;
      }
      if (allowedIds && allowedIds.length > 0 && !allowedIds.includes(item.id)) {
        return false;
      }
      if (item.visibility === normalizedPool) {
        return true;
      }
      return item.visibility === PrismaVisibilityPool.both && normalizedPool !== undefined;
    });

    return eligible.map<VisibleMediaSummary>((item) => ({
      id: item.id,
      type: item.type as ProfileMediaType,
      visibility: item.visibility,
      status: item.status,
      label: item.label,
    }));
  }

  private async assertProfile(profileId: string) {
    const exists = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Profile not found');
    }
  }

  private async fetchProfileAndVersion(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: { currentVersion: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (!profile.currentVersion) {
      throw new NotFoundException('Profile is missing a current version');
    }
    return { profile, version: profile.currentVersion };
  }
}
