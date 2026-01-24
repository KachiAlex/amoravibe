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
}

export const createLovedateApi = (options: ApiClientOptions) => {
  const client = new ApiClient(options);
  return new LovedateApi(client);
};
