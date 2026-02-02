// API types for the web app home/dashboard feed
// These types represent the expected shapes from the backend and allow
// safe normalization on the frontend.

export type DiscoverFeedMode = 'default' | 'verified' | 'nearby' | 'fresh' | 'premium' | 'shared';
export type DiscoverEventAction =
  | 'view'
  | 'like'
  | 'pass'
  | 'report'
  | 'save'
  | 'dismiss'
  | 'filter';
export type LikeActionType = 'like' | 'superlike' | 'pass' | 'report' | 'save' | 'dismiss';

export type DiscoverFilterOption = {
  label: string;
  helper?: string;
  value: string;
  premium?: boolean;
  active?: boolean;
};

export interface DiscoverCard {
  id: string;
  name: string;
  age?: number | null;
  city?: string | null;
  cityRegion?: string | null;
  distance?: string | null;
  distanceKm?: number | null;
  tags?: string[];
  image?: string | null;
  compatibility?: number;
  verified?: boolean;
  premiumOnly?: boolean;
  receiverId?: string;
  actionable?: boolean;
  [key: string]: any;
}

export interface DiscoverFeedResponse {
  hero: DiscoverCard | null;
  featured: DiscoverCard[];
  grid: DiscoverCard[];
  filters: DiscoverFilterOption[];
  total: number;
  mode: DiscoverFeedMode;
  generatedAt: string; // ISO timestamp
  [key: string]: any;
}

export interface TrustCenterSnapshotResponse {
  devices: { id: string; name?: string; trustedAt?: string }[];
  user: {
    id: string;
    displayName?: string;
    isVerified?: boolean;
    trustScore?: number;
    photos?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface LikePerson {
  id: string;
  name?: string;
  age?: number | null;
  city?: string | null;
  distance?: string | null;
  tags?: string[];
  highlight?: string;
  image?: string | null;
  premiumOnly?: boolean;
  verified?: boolean;
  likeEdgeId?: string;
}

export interface EngagementDashboardResponse {
  receivedLikes: LikePerson[];
  sentLikes: LikePerson[];
  notificationPreferences: { channel: string; label: string; helper?: string; enabled: boolean }[];
  premiumPerks: { title: string; helper?: string; cta?: string }[];
  safetyResources: { title: string; helper?: string; href?: string }[];
  settingsShortcuts: {
    label: string;
    helper?: string;
    href?: string;
    tone?: 'default' | 'danger';
  }[];
  discoverFilters: DiscoverFilterOption[];
  [key: string]: any;
}

export interface MatchCandidate {
  id: string;
  displayName?: string;
  compatibilityScore?: number;
  city?: string | null;
  cityRegion?: string | null;
  photos?: string[];
  isVerified?: boolean;
  distanceKm?: number | null;
  orientation?: string | undefined;
  matchPreferences?: string[];
  bio?: string | null;
  discoverySpace?: string;
  [key: string]: any;
}

export type DiscoverEventPayload = Record<string, unknown>;
export type MessagingStatusTone = string;

export interface MessagingThreadStatus {
  label: string;
  tone: MessagingStatusTone;
}

export interface MessagingThread {
  id: string;
  name: string;
  snippet: string;
  vibeLine: string;
  lastActive: string;
  unread: number;
  avatar: string;
  route: string;
  status: MessagingThreadStatus;
  quickReplies: string[];
  [key: string]: any;
}

export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
export type Orientation = 'straight' | 'gay' | 'lesbian' | 'bisexual' | 'asexual';
export type MatchPreference = 'men' | 'women' | 'everyone';
export type DiscoverySpace = 'nearby' | 'global';
export type VerificationIntent = 'profile' | 'payment' | 'identity';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'flagged';

// Re-export shared API types from the `@lovedate/api` package when needed
export type { TrustPreviewResponse } from '@lovedate/api';
