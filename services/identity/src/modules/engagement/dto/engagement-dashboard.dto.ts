export interface EngagementLikeDto {
  id: string;
  name: string;
  age?: number;
  city?: string;
  distance?: string;
  image: string;
  highlight: string;
  tags: string[];
  premiumOnly?: boolean;
  verified?: boolean;
}

export interface EngagementNotificationPreferenceDto {
  channel: string;
  label: string;
  helper: string;
  enabled: boolean;
}

export interface EngagementPremiumPerkDto {
  title: string;
  helper: string;
  cta: string;
}

export interface EngagementSafetyResourceDto {
  title: string;
  helper: string;
  href: string;
}

export interface EngagementSettingsShortcutDto {
  label: string;
  helper: string;
  href: string;
  tone?: 'default' | 'danger';
}

export interface EngagementDiscoverFilterDto {
  label: string;
  helper: string;
  premium?: boolean;
}

export interface EngagementDashboardResponse {
  receivedLikes: EngagementLikeDto[];
  sentLikes: EngagementLikeDto[];
  notificationPreferences: EngagementNotificationPreferenceDto[];
  premiumPerks: EngagementPremiumPerkDto[];
  safetyResources: EngagementSafetyResourceDto[];
  settingsShortcuts: EngagementSettingsShortcutDto[];
  discoverFilters: EngagementDiscoverFilterDto[];
}
