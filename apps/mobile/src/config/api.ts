import { createLovedateApi } from '@lovedate/api';

const baseUrl = process.env.EXPO_PUBLIC_IDENTITY_API_URL ?? 'http://localhost:3001';

export const lovedateApi = createLovedateApi({
  baseUrl,
  apiKey: process.env.EXPO_PUBLIC_IDENTITY_API_KEY,
});
