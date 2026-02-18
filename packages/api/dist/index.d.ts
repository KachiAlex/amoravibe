export interface ApiClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export interface MatchCandidate {
  id: string;
  displayName?: string;
  avatarUrl?: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface TrustPreviewResponse {
  summary?: string;
}

export type MessagingStatusTone = 'neutral' | 'positive' | 'negative';

export interface MessagingThread {
  id: string;
  participants?: Array<{ id: string; name?: string }>;
  lastMessage?: string;
  tone?: MessagingStatusTone;
}

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
