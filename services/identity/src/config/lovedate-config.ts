export type OrientationPool = 'hetero' | 'lgbtq';

export interface LovedateConfig {
  appName: string;
  environment: 'development' | 'staging' | 'production';
  orientationPools: OrientationPool[];
}

export const defaultConfig: LovedateConfig = {
  appName: 'Lovedate',
  environment: (process.env.NODE_ENV as LovedateConfig['environment']) || 'development',
  orientationPools: ['hetero', 'lgbtq'],
};

export const isOrientationSupported = (pool: string): pool is OrientationPool =>
  defaultConfig.orientationPools.includes(pool as OrientationPool);
