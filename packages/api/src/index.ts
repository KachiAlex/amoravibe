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
