import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

type SettingsPayload = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingNotifications: boolean;
  profileVisibility: string;
  discoveryPreference: string;
  allowMessages: boolean;
  showOnlineStatus: boolean;
  allowAnalytics: boolean;
  whoCanSeeMe: string;
  whoCanMessageMe: string;
  communityVisibility: string;
  ageRange: [number, number];
  maxDistanceMiles: number;
  intentPreferences: string[];
  dealbreakers: string[];
  twoFactorEnabled: boolean;
};

const DEFAULT_SETTINGS: SettingsPayload = {
  emailNotifications: true,
  pushNotifications: true,
  marketingNotifications: false,
  profileVisibility: 'verified_only',
  discoveryPreference: 'everywhere',
  allowMessages: true,
  showOnlineStatus: true,
  allowAnalytics: true,
  whoCanSeeMe: 'everyone',
  whoCanMessageMe: 'matches',
  communityVisibility: 'public',
  ageRange: [23, 38],
  maxDistanceMiles: 30,
  intentPreferences: ['dating'],
  dealbreakers: ['No smokers', 'No political talk'],
  twoFactorEnabled: true,
};

const mergeWithDefaults = (value: unknown): SettingsPayload => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS;
  }

  // Shallow merge to keep future keys resilient while preserving defaults.
  return { ...DEFAULT_SETTINGS, ...(value as Record<string, Prisma.JsonValue>) } as SettingsPayload;
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    const record = await this.prisma.userDashboardSetting.findUnique({ where: { userId } });
    const settings = mergeWithDefaults(record?.settings);

    return {
      settings,
      contactEmail: record?.contactEmail || null,
      phoneNumber: record?.contactPhone || null,
    };
  }

  async upsertSettings(userId: string, payload: UpdateSettingsDto) {
    const settings = mergeWithDefaults(payload.settings);

    const record = await this.prisma.userDashboardSetting.upsert({
      where: { userId },
      create: {
        userId,
        settings: settings as Prisma.InputJsonValue,
        contactEmail: payload.contactEmail ?? null,
        contactPhone: payload.phoneNumber ?? null,
      },
      update: {
        settings: settings as Prisma.InputJsonValue,
        contactEmail: payload.contactEmail ?? null,
        contactPhone: payload.phoneNumber ?? null,
      },
    });

    return {
      settings: mergeWithDefaults(record.settings),
      contactEmail: record.contactEmail ?? null,
      phoneNumber: record.contactPhone ?? null,
    };
  }
}
