/**
 * Backend service configuration
 * Uses environment variables to determine if real backend is available
 */

export const BACKEND_CONFIG = {
  // Identity service (discover, engagement, messaging, trust)
  // Default includes the Nest global prefix used by the identity service
  IDENTITY_SERVICE_URL: process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || 'http://localhost:4001/api/v1',

  // Whether to use real backend or stubs. Default to true in non-production
  // local development to surface real data when the identity service is running.
  USE_REAL_BACKEND:
    process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true' || process.env.NODE_ENV !== 'production',

  // Feature flags (default to false - use stub data until backend is ready)
  ENABLE_REAL_DISCOVER: process.env.NEXT_PUBLIC_ENABLE_REAL_DISCOVER === 'true',
  ENABLE_REAL_ENGAGEMENT: process.env.NEXT_PUBLIC_ENABLE_REAL_ENGAGEMENT === 'true',
  ENABLE_REAL_MATCHES: process.env.NEXT_PUBLIC_ENABLE_REAL_MATCHES === 'true',
  ENABLE_REAL_MESSAGING: process.env.NEXT_PUBLIC_ENABLE_REAL_MESSAGING === 'true',
  ENABLE_REAL_TRUST: process.env.NEXT_PUBLIC_ENABLE_REAL_TRUST === 'true',
};

/**
 * Helper to construct backend service URL
 */
export function getBackendUrl(path: string): string {
  return `${BACKEND_CONFIG.IDENTITY_SERVICE_URL}${path}`;
}
