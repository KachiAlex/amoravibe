/**
 * Backend service configuration
 * Uses environment variables to determine if real backend is available
 */

export const BACKEND_CONFIG = {
  // Identity service (discover, engagement, messaging, trust)
  IDENTITY_SERVICE_URL: process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || 'http://localhost:3001',

  // Whether to use real backend or stubs
  USE_REAL_BACKEND: process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true',

  // Feature flags
  ENABLE_REAL_DISCOVER: process.env.NEXT_PUBLIC_ENABLE_REAL_DISCOVER !== 'false',
  ENABLE_REAL_ENGAGEMENT: process.env.NEXT_PUBLIC_ENABLE_REAL_ENGAGEMENT !== 'false',
  ENABLE_REAL_MESSAGING: process.env.NEXT_PUBLIC_ENABLE_REAL_MESSAGING !== 'false',
  ENABLE_REAL_TRUST: process.env.NEXT_PUBLIC_ENABLE_REAL_TRUST !== 'false',
};

/**
 * Helper to construct backend service URL
 */
export function getBackendUrl(path: string): string {
  return `${BACKEND_CONFIG.IDENTITY_SERVICE_URL}${path}`;
}
