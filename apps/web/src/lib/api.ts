import { createLovedateApi } from '@lovedate/api';
import { resolveTrustApiBase } from '@/lib/trust-upstream';

const normalizeBaseUrl = (value: string) => {
  if (!value) return value;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }
  return `https://${value}`;
};

const resolveBaseUrl = () => {
  if (typeof window === 'undefined') {
    return normalizeBaseUrl(resolveTrustApiBase());
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
