import { createLovedateApi } from '@lovedate/api';

const resolveBaseUrl = () => {
  if (typeof window === 'undefined') {
    return (
      process.env.TRUST_API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_TRUST_API_URL ||
      'http://localhost:4001/api/v1'
    );
  }

  return process.env.NEXT_PUBLIC_TRUST_API_URL || '/api/trust';
};

export const lovedateApi = createLovedateApi({
  baseUrl: resolveBaseUrl(),
  apiKey: process.env.TRUST_API_KEY,
});
