import { Injectable } from '@nestjs/common';
import {
  LovedateConfig,
  OrientationPool,
  defaultConfig,
  isOrientationSupported,
  KycConfig,
  ModerationConfig,
  AuditConfig,
  AnalyticsConfig,
} from './lovedate-config';

@Injectable()
export class AppConfigService {
  private readonly config: LovedateConfig = defaultConfig;

  get appName(): string {
    return this.config.appName;
  }

  get environment(): LovedateConfig['environment'] {
    return this.config.environment;
  }

  get orientationPools(): OrientationPool[] {
    return this.config.orientationPools;
  }

  get kyc(): KycConfig {
    return this.config.kyc;
  }

  get moderation(): ModerationConfig {
    return this.config.moderation;
  }

  get audit(): AuditConfig {
    return this.config.audit;
  }

  get analytics(): AnalyticsConfig {
    return this.config.analytics;
  }

  getKycWebhookToleranceMs(): number {
    return this.config.kyc.webhookToleranceSeconds * 1000;
  }

  assertOrientationPool(pool: string): asserts pool is OrientationPool {
    if (!isOrientationSupported(pool)) {
      throw new Error(`Orientation pool ${pool} is not supported.`);
    }
  }
}
