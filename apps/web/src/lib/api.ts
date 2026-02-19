// Use workspace @lovedate/api stub at runtime so frontend has full API shape
import { createLovedateApi } from '@lovedate/api';

// Prefer an explicit public API host when the client-side NEXT_PUBLIC_API_BASE_URL
// isn't set (Netlify builds often don't include internal /api server routes).
const PUBLIC_TRUST_API_FALLBACK =
  process.env.NEXT_PUBLIC_TRUST_API_URL || 'https://amoravibe-identity.netlify.app/api/v1';

export const lovedateApi = createLovedateApi({
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || // local proxy / serverless API
    PUBLIC_TRUST_API_FALLBACK, // fallback to public trust API for deployed sites
});

