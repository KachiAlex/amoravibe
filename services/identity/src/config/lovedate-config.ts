export type OrientationPool = 'hetero' | 'lgbtq';

export interface KycConfig {
  provider: string;
  apiBaseUrl: string;
  apiKey: string;
  webhookSecret: string;
  webhookToleranceSeconds: number;
  uploadBucket: string;
  uploadTtlMinutes: number;
}

export interface LovedateConfig {
  appName: string;
  environment: 'development' | 'staging' | 'production';
  orientationPools: OrientationPool[];
  kyc: KycConfig;
}

const env = process.env;

const numberFromEnv = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const defaultConfig: LovedateConfig = {
  appName: 'Lovedate',
  environment: (process.env.NODE_ENV as LovedateConfig['environment']) || 'development',
  orientationPools: ['hetero', 'lgbtq'],
  kyc: {
    provider: env.KYC_PROVIDER ?? 'persona',
    apiBaseUrl: env.KYC_API_BASE_URL ?? 'https://mock-kyc.local',
    apiKey: env.KYC_API_KEY ?? 'mock-api-key',
    webhookSecret: env.KYC_WEBHOOK_SECRET ?? 'mock-webhook-secret',
    webhookToleranceSeconds: numberFromEnv(env.KYC_WEBHOOK_TOLERANCE_SECONDS, 300),
    uploadBucket: env.KYC_UPLOAD_BUCKET ?? 'lovedate-kyc-uploads',
    uploadTtlMinutes: numberFromEnv(env.KYC_UPLOAD_TTL_MINUTES, 30),
  },
};

export const isOrientationSupported = (pool: string): pool is OrientationPool =>
  defaultConfig.orientationPools.includes(pool as OrientationPool);
