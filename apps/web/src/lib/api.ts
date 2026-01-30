import { createLovedateApi } from '@lovedate/api';

const normalizeBaseUrl = (value: string) => {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }
  return `https://${value}`;
};

const resolveBaseUrl = () => {
  if (typeof window === 'undefined') {
    const upstream =
      process.env.TRUST_API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_TRUST_API_URL ||
      'http://localhost:4001/api/v1';
    return normalizeBaseUrl(upstream);
  }

  const clientTarget = process.env.NEXT_PUBLIC_TRUST_API_URL;
  if (!clientTarget) {
    return '/api/trust';
  }

  const normalized = normalizeBaseUrl(clientTarget);

  try {
    const currentOrigin = window.location.origin;
    const targetOrigin = normalized.startsWith('/') ? currentOrigin : new URL(normalized).origin;
    if (targetOrigin !== currentOrigin) {
      return '/api/trust';
    }
  } catch {
    return '/api/trust';
  }

  return normalized;
};

export const lovedateApi = createLovedateApi({
  baseUrl: resolveBaseUrl(),
  apiKey: process.env.TRUST_API_KEY,
});
