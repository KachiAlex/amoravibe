import { v2 as cloudinary } from 'cloudinary';

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
};

function readEnv(): CloudinaryConfig {
  const cfg = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? '',
  } as const;

  if (!cfg.cloudName || !cfg.apiKey || !cfg.apiSecret || !cfg.uploadPreset) {
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
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    upload_preset: cfg.uploadPreset,
    ...extra,
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
