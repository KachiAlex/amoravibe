// Use workspace @lovedate/api stub at runtime so frontend has full API shape
import { createLovedateApi } from '@lovedate/api';

// Prefer a relative `/api` base for a single Vercel project setup. If you need to
// point at a separate backend, set `NEXT_PUBLIC_API_BASE_URL` in the Vercel env.
const DEFAULT_API_BASE = '/api';

export const lovedateApi = createLovedateApi({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ? process.env.NEXT_PUBLIC_API_BASE_URL : DEFAULT_API_BASE,
});

