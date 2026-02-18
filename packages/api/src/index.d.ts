export interface ApiClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export type Gender =
  | 'woman'
  | 'man'
  | 'non_binary'
  | 'trans_woman'
  | 'trans_man'
  | 'self_describe';

export type Orientation =
  | 'heterosexual'
  | 'gay'
  | 'lesbian'
  | 'bisexual'
  | 'pansexual'
  | 'asexual'
  | 'queer';

export type DiscoverySpace = 'straight' | 'lgbtq' | 'both';

export type MatchPreference = 'women' | 'men' | 'everyone';

export type VerificationIntent = 'verify_now' | 'verify_later' | 'skip';

export interface MatchCandidate {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  age?: number | null;
  city?: string | null;
  cityRegion?: string | null;
  orientation?: string | null;
  discoverySpace?: DiscoverySpace | null;
  matchPreferences?: MatchPreference[];
  compatibilityScore?: number;
  isVerified?: boolean;
  photos?: string[];
  bio?: string | null;
  distanceKm?: number | null;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface TrustPreviewResponse {
  summary?: string;
}

export type MessagingStatusTone = 'violet' | 'rose' | 'amber' | 'emerald' | 'neutral' | 'positive' | 'negative';

export interface MessagingThread {
  id: string;
  name?: string;
  avatar?: string;
  route?: string;
  lastActive?: string;
  snippet?: string;
  vibeLine?: string;
  unread?: boolean;
  quickReplies?: string[];
  status?: { tone: MessagingStatusTone; label?: string };
}

export type DiscoverFeedMode = 'default' | 'verified' | 'nearby' | 'fresh' | 'premium' | 'shared';

export interface DiscoverFilterOption {
  label: string;
  helper?: string;
  value?: string;
  premium?: boolean;
  active?: boolean;
}

export interface DiscoverCard {
  id: string;
  name: string;
  age?: number | null;
  city?: string | null;
  cityRegion?: string | null;
  distance?: string | null;
  distanceKm?: number | null;
  tags?: string[];
  image?: string;
  compatibility?: number;
  verified?: boolean;
  premiumOnly?: boolean;
  receiverId?: string;
  actionable?: boolean;
}

export type DiscoverEventAction = 'view' | 'like' | 'pass' | 'save' | 'dismiss' | 'filter';
export type LikeActionType = 'like' | 'pass' | 'nudge' | 'unlike';
export type DiscoverEventPayload = any;

export interface DiscoverFeedResponse {
  hero: DiscoverCard | null;
  featured: DiscoverCard[];
  grid: DiscoverCard[];
  filters: DiscoverFilterOption[];
  total: number;
  mode: DiscoverFeedMode;
  generatedAt?: string;
}

export interface EngagementDashboardResponse { [k: string]: any }
export interface TrustCenterSnapshotResponse { [k: string]: any }

export interface LovedateApi {
  fetchMatches(opts?: any): Promise<MatchCandidate[]>;
  fetchTrustPreview(): Promise<TrustPreviewResponse>;
  requestAuditExport(opts?: any): Promise<any>;
  requestAuditPurge(opts?: any): Promise<any>;
  requestReverification(opts?: any): Promise<any>;
  fetchTrustSnapshot(userId?: string): Promise<any>;
  fetchEngagementDashboard(userId?: string): Promise<any>;
  fetchMessagingThreads(userId?: string, limit?: number): Promise<MessagingThread[]>;
  fetchDiscoverFeed(opts?: any): Promise<any[]>;
  likeUser(payload?: any): Promise<any>;
  nudgeLike(likeId?: string): Promise<any>;
  toggleNotification(channel: string, opts?: any): Promise<any>;
  trackDiscoverEvent(payload?: any): Promise<void>;
  submitOnboarding(payload?: any): Promise<any>;
}

export declare function createLovedateApi(options?: ApiClientOptions): LovedateApi;
