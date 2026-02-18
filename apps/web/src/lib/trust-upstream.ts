const DEV_DEFAULT = 'http://localhost:4001/api/v1';
const PROD_DEFAULT = 'https://api-amoravibe.vercel.app/api/v1';

/**
 * Default upstream base used when no env override is provided.
 * Uses localhost during `next dev`, otherwise points at the Vercel backend.
 */
export const TRUST_API_DEFAULT_BASE =
  process.env.NODE_ENV === 'development' ? DEV_DEFAULT : PROD_DEFAULT;

/**
 * Resolve the upstream base URL for server-side proxying.
 * Prefers explicit env vars but falls back to the environment-aware default.
 */
export const resolveTrustApiBase = () =>
  (
    process.env.TRUST_API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_TRUST_API_URL ||
    TRUST_API_DEFAULT_BASE
  ).replace(/\/$/, '');
