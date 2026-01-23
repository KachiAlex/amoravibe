import { Injectable } from '@nestjs/common';
import {
  LovedateConfig,
  OrientationPool,
  defaultConfig,
  isOrientationSupported,
  KycConfig,
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

  getKycWebhookToleranceMs(): number {
    return this.config.kyc.webhookToleranceSeconds * 1000;
  }

  assertOrientationPool(pool: string): asserts pool is OrientationPool {
    if (!isOrientationSupported(pool)) {
      throw new Error(`Orientation pool ${pool} is not supported.`);
    }
  }
}
