import { Injectable } from '@nestjs/common';
import { ProfileServiceConfig, defaultProfileConfig } from './profile-config';

@Injectable()
export class ProfileConfigService {
  private readonly config: ProfileServiceConfig = defaultProfileConfig;

  get appName(): string {
    return this.config.appName;
  }

  get environment(): ProfileServiceConfig['environment'] {
    return this.config.environment;
  }

  get orientationPools(): ProfileServiceConfig['orientationPools'] {
    return this.config.orientationPools;
  }

  get media() {
    return this.config.media;
  }
}
