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
  // Always use NEXT_PUBLIC_TRUST_API_URL if set
  const clientTarget = process.env.NEXT_PUBLIC_TRUST_API_URL;
  if (clientTarget) {
    // Normalize and ensure we point at the API prefix used by the backend.
    // If the provided URL already contains any `/api` path, respect it.
    // Otherwise append `/api/v1` which is the global prefix used by the identity service.
    let normalized = normalizeBaseUrl(clientTarget);
    if (!/\/api(\/|$)/.test(normalized)) {
      normalized = normalized.replace(/\/+$/, '');
      normalized = `${normalized}/api/v1`;
    }
    return normalized;
  }
  // Fallback for SSR or missing env
  if (typeof window === 'undefined') {
    return normalizeBaseUrl(resolveTrustApiBase());
  }
  return '/api/trust';
};

export const lovedateApi = createLovedateApi({
  baseUrl: resolveBaseUrl(),
  apiKey: process.env.TRUST_API_KEY,
});

// Debug log for production
if (typeof window !== 'undefined') {
  console.log('API base URL:', lovedateApi.baseUrl);
}
