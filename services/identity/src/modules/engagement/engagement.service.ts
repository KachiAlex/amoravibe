import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EngagementDashboardResponse,
  EngagementDiscoverFilterDto,
  EngagementLikeDto,
  EngagementNotificationPreferenceDto,
  EngagementPremiumPerkDto,
  EngagementSafetyResourceDto,
  EngagementSettingsShortcutDto,
} from './dto/engagement-dashboard.dto';
import { LikeActionDto, LikeActionType } from './dto/like-action.dto';
import { NotificationToggleDto } from './dto/notification-toggle.dto';
import { Prisma, User, NotificationPreference, $Enums } from '../../prisma/client';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80';

const DEFAULT_NOTIFICATION_PREFS: EngagementNotificationPreferenceDto[] = [
  {
    channel: 'push',
    label: 'Push notifications',
    helper: 'Instant match + message alerts',
    enabled: true,
  },
  {
    channel: 'email',
    label: 'Email recaps',
    helper: 'Daily digest of likes + invites',
    enabled: false,
  },
  {
    channel: 'quiet',
    label: 'Quiet hours',
    helper: 'Mute alerts 10pm-8am',
    enabled: true,
  },
];

const DEFAULT_PREMIUM_PERKS: EngagementPremiumPerkDto[] = [
  { title: 'Boost your profile', helper: 'Top of feeds for 60 minutes', cta: 'Boost now' },
  { title: 'See who liked you', helper: 'Instant match with admirers', cta: 'View likes' },
  {
    title: 'Advanced filters',
    helper: 'Height, lifestyle, intent controls',
    cta: 'Unlock filters',
  },
];

const DEFAULT_SAFETY_RESOURCES: EngagementSafetyResourceDto[] = [
  { title: 'Report a profile', helper: 'Flag suspicious behavior', href: '/support/report' },
  { title: 'Blocked users', helper: 'Manage who can contact you', href: '/settings/blocked' },
  { title: 'Safety playbook', helper: 'Tips curated by our trust team', href: '/support/safety' },
];

const DEFAULT_SETTINGS_SHORTCUTS: EngagementSettingsShortcutDto[] = [
  { label: 'Account details', helper: 'Name, email, phone', href: '/settings/profile' },
  { label: 'Password & security', helper: 'Passcodes, devices, MFA', href: '/settings/security' },
  { label: 'Privacy & visibility', helper: 'Discovery space, distance', href: '/settings/privacy' },
  {
    label: 'Pause account',
    helper: 'Take a break without losing matches',
    href: '/settings/pause',
  },
  {
    label: 'Delete account',
    helper: 'Remove data permanently',
    href: '/settings/delete',
    tone: 'danger',
  },
];

const DEFAULT_DISCOVER_FILTERS: EngagementDiscoverFilterDto[] = [
  { label: 'Nearby', helper: 'Within 10 miles' },
  { label: 'New this week', helper: 'Freshly onboarded' },
  { label: 'Recently active', helper: 'Seen in the last 24h' },
  { label: 'Verified only', helper: 'Photo / ID verified' },
  { label: 'Shared interests', helper: 'Match your lifestyle tags' },
  { label: 'Online now', helper: 'Ready to chat', premium: true },
  { label: 'Advanced filters', helper: 'Height, lifestyle, intent', premium: true },
];

type UserLikeWithUsers = Prisma.UserLikeGetPayload<{
  include: { sender: true; receiver: true };
}>;

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string): Promise<EngagementDashboardResponse> {
    await this.ensureUser(userId);

    const [
      receivedLikes,
      sentLikes,
      notificationPrefs,
      premiumPerks,
      safetyResources,
      settings,
      filters,
    ] = await Promise.all([
      this.prisma.userLike.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { sender: true, receiver: true },
      }),
      this.prisma.userLike.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { sender: true, receiver: true },
      }),
      this.prisma.notificationPreference.findMany({ where: { userId } }),
      this.prisma.premiumPerk.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { title: true, helper: true, cta: true },
      }),
      this.prisma.safetyResource.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.settingsShortcut.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.discoverFilter.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return {
      receivedLikes: receivedLikes.map((like) => this.toLikeDto(like, 'sender')),
      sentLikes: sentLikes.map((like) => this.toLikeDto(like, 'receiver')),
      notificationPreferences: this.mapNotificationPreferences(notificationPrefs),
      premiumPerks: premiumPerks.length
        ? this.mapPremiumPerks(premiumPerks)
        : DEFAULT_PREMIUM_PERKS,
      safetyResources: safetyResources.length
        ? safetyResources.map((resource) => ({
            title: resource.title,
            helper: resource.helper,
            href: resource.href,
          }))
        : DEFAULT_SAFETY_RESOURCES,
      settingsShortcuts: settings.length
        ? settings.map((setting) => ({
            label: setting.label,
            helper: setting.helper,
            href: setting.href,
            tone: (setting.tone as 'default' | 'danger' | null) ?? 'default',
          }))
        : DEFAULT_SETTINGS_SHORTCUTS,
      discoverFilters: filters.length
        ? filters.map((filter) => ({
            label: filter.label,
            helper: filter.helper,
            premium: filter.premium,
          }))
        : DEFAULT_DISCOVER_FILTERS,
    };
  }

  async applyLikeAction(dto: LikeActionDto): Promise<EngagementLikeDto> {
    await Promise.all([this.ensureUser(dto.senderId), this.ensureUser(dto.receiverId)]);

    const existing = await this.prisma.userLike.findFirst({
      where: { senderId: dto.senderId, receiverId: dto.receiverId },
      include: { sender: true, receiver: true },
    });

    const baseData: Prisma.UserLikeUncheckedCreateInput = {
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      highlight: dto.highlight ?? existing?.highlight ?? null,
      tags: dto.tags ?? existing?.tags ?? [],
      status: this.statusForAction(dto.action),
      savedAt: dto.action === 'save' ? new Date() : (existing?.savedAt ?? null),
    };

    let record: UserLikeWithUsers;

    if (existing) {
      record = await this.prisma.userLike.update({
        where: { id: existing.id },
        data: {
          status: baseData.status,
          highlight: baseData.highlight,
          tags: baseData.tags,
          savedAt: baseData.savedAt,
        },
        include: { sender: true, receiver: true },
      });
    } else {
      record = await this.prisma.userLike.create({
        data: baseData,
        include: { sender: true, receiver: true },
      });
    }

    return this.toLikeDto(record, 'receiver');
  }

  async nudgeLike(likeId: string): Promise<EngagementLikeDto> {
    const updated = await this.prisma.userLike.update({
      where: { id: likeId },
      data: { nudgedAt: new Date() },
      include: { sender: true, receiver: true },
    });

    return this.toLikeDto(updated, 'receiver');
  }

  async toggleNotification(
    channel: string,
    dto: NotificationToggleDto
  ): Promise<EngagementNotificationPreferenceDto> {
    await this.ensureUser(dto.userId);

    const template = DEFAULT_NOTIFICATION_PREFS.find((pref) => pref.channel === channel);

    const preference = await this.prisma.notificationPreference.upsert({
      where: { userId_channel: { userId: dto.userId, channel } },
      create: {
        userId: dto.userId,
        channel,
        label: template?.label ?? this.formatChannelLabel(channel),
        helper: template?.helper ?? '',
        enabled: dto.enabled,
      },
      update: { enabled: dto.enabled },
    });

    return {
      channel: preference.channel,
      label: preference.label,
      helper: preference.helper,
      enabled: preference.enabled,
    };
  }

  private statusForAction(action: LikeActionType): $Enums.LikeEdgeStatus {
    switch (action) {
      case 'pass':
        return $Enums.LikeEdgeStatus.passed;
      case 'save':
      case 'like':
      default:
        return $Enums.LikeEdgeStatus.pending;
    }
  }

  private mapNotificationPreferences(
    prefs: NotificationPreference[]
  ): EngagementNotificationPreferenceDto[] {
    if (!prefs.length) {
      return DEFAULT_NOTIFICATION_PREFS;
    }

    return prefs.map((pref) => ({
      channel: pref.channel,
      label: pref.label,
      helper: pref.helper,
      enabled: pref.enabled,
    }));
  }

  private mapPremiumPerks(
    records: Array<{ title: string; helper: string; cta: string }>
  ): EngagementPremiumPerkDto[] {
    return records.map((perk) => ({ title: perk.title, helper: perk.helper, cta: perk.cta }));
  }

  private toLikeDto(
    like: UserLikeWithUsers,
    perspective: 'sender' | 'receiver'
  ): EngagementLikeDto {
    const person = perspective === 'sender' ? like.sender : like.receiver;
    if (!person) {
      throw new NotFoundException('Like edge missing related user');
    }

    return {
      id: like.id,
      name: person.displayName,
      city: person.city,
      image: this.extractPrimaryPhoto(person.photos) ?? FALLBACK_IMAGE,
      highlight:
        like.highlight ??
        (perspective === 'sender' ? 'Blurred for privacy' : 'You liked this member'),
      tags: like.tags ?? [],
      verified: person.isVerified ?? false,
    };
  }

  private extractPrimaryPhoto(photos: Prisma.JsonValue | null): string | null {
    if (!Array.isArray(photos)) {
      return null;
    }

    const firstImage = photos.find((photo): photo is string => typeof photo === 'string');
    return firstImage ?? null;
  }

  private formatChannelLabel(channel: string) {
    return channel.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private async ensureUser(userId: string): Promise<User> {
    try {
      if (!this.prisma.isConnected()) {
        // DB unavailable in dev: return placeholder user
        // eslint-disable-next-line no-console
        console.warn('[EngagementService] Prisma not connected, returning placeholder user');
        return ({ id: userId, displayName: userId, photos: [], isVerified: false } as unknown) as User;
      }

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }
      return user;
    } catch (err) {
      // If DB error occurs, return placeholder to avoid failing flows in dev
      // eslint-disable-next-line no-console
      console.error('[EngagementService] Error ensuring user:', err);
      return ({ id: userId, displayName: userId, photos: [], isVerified: false } as unknown) as User;
    }
  }
}
