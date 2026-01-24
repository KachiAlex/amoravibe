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

export interface ModerationConfig {
  baseUrl: string;
}

export interface AuditConfig {
  exportBucket: string;
  retentionDays: number;
}

export interface AnalyticsConfig {
  warehouseUrl: string;
  piiHashSalt: string;
  snapshotWindowMinutes: number;
}

export interface LovedateConfig {
  appName: string;
  environment: 'development' | 'staging' | 'production';
  orientationPools: OrientationPool[];
  kyc: KycConfig;
  moderation: ModerationConfig;
  audit: AuditConfig;
  analytics: AnalyticsConfig;
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
  moderation: {
    baseUrl: env.MODERATION_SERVICE_URL ?? 'http://localhost:3102/api/v1',
  },
  audit: {
    exportBucket: env.AUDIT_EXPORT_BUCKET ?? 'lovedate-audit-exports',
    retentionDays: numberFromEnv(env.AUDIT_RETENTION_DAYS, 365),
  },
  analytics: {
    warehouseUrl:
      env.ANALYTICS_DB_URL ??
      env.IDENTITY_DATABASE_URL ??
      'postgresql://localhost:5432/lovedate_identity',
    piiHashSalt: env.PII_HASH_SALT ?? 'local-dev-salt',
    snapshotWindowMinutes: numberFromEnv(env.ANALYTICS_SNAPSHOT_WINDOW_MINUTES, 60),
  },
};

export const isOrientationSupported = (pool: string): pool is OrientationPool =>
  defaultConfig.orientationPools.includes(pool as OrientationPool);
