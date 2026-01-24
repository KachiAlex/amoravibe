import { createLovedateApi } from '@lovedate/api';

const baseUrl = process.env.NEXT_PUBLIC_TRUST_API_URL || 'http://localhost:3001';

export const lovedateApi = createLovedateApi({
  baseUrl,
  apiKey: process.env.TRUST_API_KEY,
});
