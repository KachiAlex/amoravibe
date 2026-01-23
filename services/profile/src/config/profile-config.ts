export type VisibilityPool = 'hetero' | 'lgbtq' | 'both';

export interface MediaUploadConfig {
  uploadBucket: string;
  uploadTtlMinutes: number;
  maxFileSizeMb: number;
  minFileSizeKb: number;
  allowedPhotoMimePrefixes: string[];
  allowedVideoMimePrefixes: string[];
}

export interface ProfileServiceConfig {
  appName: string;
  environment: 'development' | 'staging' | 'production';
  orientationPools: VisibilityPool[];
  media: MediaUploadConfig;
}

const env = process.env;

const numberFromEnv = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const arrayFromEnv = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const orientationPoolValues: VisibilityPool[] = ['hetero', 'lgbtq', 'both'];

const parseOrientationPools = (value: string | undefined): VisibilityPool[] => {
  const parsed = arrayFromEnv(value, orientationPoolValues);
  const filtered = parsed.filter((pool): pool is VisibilityPool =>
    orientationPoolValues.includes(pool as VisibilityPool)
  );
  return filtered.length > 0 ? filtered : orientationPoolValues;
};

export const defaultProfileConfig: ProfileServiceConfig = {
  appName: env.PROFILE_SERVICE_NAME ?? 'Lovedate Profile Service',
  environment: (env.NODE_ENV as ProfileServiceConfig['environment']) || 'development',
  orientationPools: parseOrientationPools(env.ORIENTATION_POOLS),
  media: {
    uploadBucket: env.PROFILE_MEDIA_BUCKET ?? 'lovedate-profile-media',
    uploadTtlMinutes: numberFromEnv(env.PROFILE_MEDIA_UPLOAD_TTL_MINUTES, 15),
    maxFileSizeMb: numberFromEnv(env.PROFILE_MEDIA_MAX_FILE_SIZE_MB, 15),
    minFileSizeKb: numberFromEnv(env.PROFILE_MEDIA_MIN_FILE_SIZE_KB, 10),
    allowedPhotoMimePrefixes: arrayFromEnv(env.PROFILE_MEDIA_PHOTO_MIME_PREFIXES, [
      'image/jpeg',
      'image/png',
      'image/heic',
      'image/heif',
    ]),
    allowedVideoMimePrefixes: arrayFromEnv(env.PROFILE_MEDIA_VIDEO_MIME_PREFIXES, [
      'video/mp4',
      'video/quicktime',
    ]),
  },
};
