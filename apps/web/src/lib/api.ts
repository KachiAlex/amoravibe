// Use workspace @lovedate/api stub at runtime so frontend has full API shape
import { createLovedateApi } from '@lovedate/api';

export const lovedateApi = createLovedateApi({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
});

