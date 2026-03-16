import { v2 as cloudinary } from 'cloudinary';

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
};

function readEnv(): CloudinaryConfig {
  // Support both plain and NEXT_PUBLIC_ prefixed env vars for flexibility
  const get = (key: string) =>
    (process.env[key] ?? process.env[`NEXT_PUBLIC_${key}`] ?? '').trim();

  const cfg = {
    cloudName: get('CLOUDINARY_CLOUD_NAME'),
    apiKey: get('CLOUDINARY_API_KEY'),
    apiSecret: get('CLOUDINARY_API_SECRET'),
    // Get preset name as-is but trim leading/trailing whitespace (don't remove internal spaces)
    uploadPreset: get('CLOUDINARY_UPLOAD_PRESET'),
  } as const;

  // Debug log – show which vars are set (mask secret)
  console.log('[cloudinary] env vars:', {
    cloudName: cfg.cloudName ? '✅' : '❌',
    apiKey: cfg.apiKey ? '✅' : '❌',
    apiSecret: cfg.apiSecret ? '✅' : '❌', // do not print actual secret
    uploadPreset: cfg.uploadPreset ? '✅' : '❌',
  });

  // Identify missing variables for clearer error messages
  const missing = Object.entries(cfg)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error('[cloudinary] Missing environment variables:', missing.join(', '));
    throw new Error('Cloudinary environment variables are missing.');
  }

  return cfg;
}

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;
  const cfg = readEnv();
  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
  });
  isConfigured = true;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  return readEnv();
}

export function buildUploadSignature(extra: Record<string, string | number> = {}) {
  ensureConfigured();
  const cfg = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  // Remove undefined or null values from extra params
  const cleanedExtra: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== null) {
      cleanedExtra[key] = value as string | number;
    }
  }
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    upload_preset: cfg.uploadPreset,
    ...cleanedExtra,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, cfg.apiSecret);
  return {
    signature,
    timestamp,
    cloudName: cfg.cloudName,
    apiKey: cfg.apiKey,
    uploadPreset: cfg.uploadPreset,
    paramsToSign,
  };
}
