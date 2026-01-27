import fetch from 'cross-fetch';

export interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor({ baseUrl, apiKey }: ApiClientOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      method: 'GET',
      headers: this.withHeaders(init?.headers),
    });

    if (!response.ok) {
      throw new Error(`Request to ${path} failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      method: 'POST',
      headers: this.withHeaders(init?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request to ${path} failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  private withHeaders(headers?: HeadersInit): HeadersInit {
    const base: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      base['x-api-key'] = this.apiKey;
    }

    return {
      ...base,
      ...this.normalizeHeaders(headers),
    };
  }

  private normalizeHeaders(source?: HeadersInit): Record<string, string> {
    if (!source) {
      return {};
    }

    if (source instanceof Headers) {
      const record: Record<string, string> = {};
      source.forEach((value, key) => {
        record[key] = value;
      });
      return record;
    }

    if (Array.isArray(source)) {
      return source.reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    }

    return source;
  }
}

export type Gender = 'man' | 'woman' | 'non_binary' | 'trans_man' | 'trans_woman' | 'self_describe';

export type Orientation =
  | 'heterosexual'
  | 'gay'
  | 'lesbian'
  | 'bisexual'
  | 'pansexual'
  | 'asexual'
  | 'queer';

export type DiscoverySpace = 'straight' | 'lgbtq' | 'both';

export type MatchPreference = 'men' | 'women' | 'everyone';

export interface MatchCandidate {
  id: string;
  displayName: string;
  city: string;
  bio: string | null;
  photos: string[];
  trustScore: number;
  orientation: Orientation;
  matchPreferences: MatchPreference[];
  discoverySpace: DiscoverySpace;
  isVerified: boolean;
  compatibilityScore: number;
}

export interface FetchMatchesParams {
  userId: string;
  limit?: number;
}

export type VerificationIntent = 'verify_now' | 'skip';

export interface TrustPreviewJourneyStep {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export interface TrustPreviewHighlight {
  title: string;
  body: string;
  badge: string;
}

export interface TrustPreviewStats {
  verificationPassRate: number;
  riskHealth: 'stable' | 'elevated' | 'critical';
  exportSlaHours: number;
}

export interface TrustPreviewResponse {
  snapshotLabel: string;
  stats: TrustPreviewStats;
  journey: TrustPreviewJourneyStep[];
  highlights: TrustPreviewHighlight[];
}

export type OnboardingStepStatus = 'pending' | 'active' | 'complete';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: OnboardingStepStatus;
}

export interface OnboardingStatusResponse {
  userId: string;
  progressPercent: number;
  steps: OnboardingStep[];
}

export interface OnboardingSubmissionPayload {
  legalName: string;
  legalLastName?: string;
  displayName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  password: string;
  gender: Gender;
  orientation: Orientation;
  orientationPreferences: Orientation[];
  discoverySpace: DiscoverySpace;
  matchPreferences: MatchPreference[];
  city: string;
  bio?: string;
  photos: string[];
  verificationIntent: VerificationIntent;
}

export interface OnboardingSubmissionResponse {
  user: {
    id: string;
    displayName: string;
  };
  verification: {
    id: string;
    status: VerificationStatus;
  };
  nextRoute: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'flagged';

export interface ReverifyResponse {
  id: string;
  userId: string;
  provider: string;
  status: VerificationStatus;
  reference: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface ReverifyPayload {
  userId: string;
}

export interface TrustCenterUserDto {
  id: string;
  displayName: string;
  isVerified: boolean;
  trustScore: number;
  createdAt: string;
}

export interface TrustCenterVerificationDto {
  id: string;
  provider: string;
  status: VerificationStatus;
  updatedAt: string | null;
}

export interface TrustCenterRiskProfileDto {
  trustScore: number;
  lastEvaluatedAt: string | null;
  metrics: Record<string, unknown> | null;
}

export interface TrustCenterDeviceDto {
  id: string;
  hash: string;
  observedAt: string;
  riskLabel: string | null;
  userAgent: string | null;
}

export interface TrustCenterRiskSignalDto {
  id: string;
  type: string;
  channel: string;
  severity: string;
  score: number | null;
  createdAt: string;
}

export interface TrustCenterModerationEventDto {
  id: string;
  severity: string;
  message: string;
  createdAt: string;
}

export interface TrustCenterAuditSummaryDto {
  totalEvents: number;
  lastEventAt: string | null;
}

export interface TrustCenterSnapshotResponse {
  user: TrustCenterUserDto;
  verification: TrustCenterVerificationDto | null;
  riskProfile: TrustCenterRiskProfileDto | null;
  devices: TrustCenterDeviceDto[];
  riskSignals: TrustCenterRiskSignalDto[];
  moderationEvents: TrustCenterModerationEventDto[];
  auditSummary: TrustCenterAuditSummaryDto;
}

export interface AuditPrivacyRequestResponse {
  id: string;
  requestedAt: string;
  status: string;
}

export interface CreateAuditExportRequestPayload {
  extra?: Record<string, unknown>;
}

export interface CreateAuditExportRequest {
  userId: string;
  payload?: CreateAuditExportRequestPayload;
}

export interface CreateAuditPurgeRequest {
  userId: string;
  reason?: string;
}

export class LovedateApi {
  constructor(private readonly client: ApiClient) {}

  fetchTrustPreview(): Promise<TrustPreviewResponse> {
    return this.client.get<TrustPreviewResponse>('/analytics/trust-preview');
  }

  fetchOnboardingStatus(userId: string): Promise<OnboardingStatusResponse> {
    return this.client.get<OnboardingStatusResponse>(
      `/onboarding/status?userId=${encodeURIComponent(userId)}`
    );
  }

  submitOnboarding(payload: OnboardingSubmissionPayload): Promise<OnboardingSubmissionResponse> {
    return this.client.post<OnboardingSubmissionResponse>('/onboarding', payload);
  }

  fetchTrustSnapshot(userId: string): Promise<TrustCenterSnapshotResponse> {
    return this.client.get<TrustCenterSnapshotResponse>(`/trust/center/${userId}`);
  }

  fetchMatches(params: FetchMatchesParams): Promise<MatchCandidate[]> {
    const query = new URLSearchParams({ userId: params.userId });
    if (typeof params.limit === 'number') {
      query.set('limit', params.limit.toString());
    }

    return this.client.get<MatchCandidate[]>(`/matches?${query.toString()}`);
  }

  requestReverification(payload: ReverifyPayload): Promise<ReverifyResponse> {
    return this.client.post<ReverifyResponse>('/onboarding/reverify', payload);
  }

  requestAuditExport(payload: CreateAuditExportRequest): Promise<AuditPrivacyRequestResponse> {
    return this.client.post<AuditPrivacyRequestResponse>('/audit/privacy/exports', payload);
  }

  requestAuditPurge(payload: CreateAuditPurgeRequest): Promise<AuditPrivacyRequestResponse> {
    return this.client.post<AuditPrivacyRequestResponse>('/audit/privacy/purges', payload);
  }
}

export const createLovedateApi = (options: ApiClientOptions) => {
  const client = new ApiClient(options);
  return new LovedateApi(client);
};
