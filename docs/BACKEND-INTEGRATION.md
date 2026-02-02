# Backend Integration Architecture

## Overview

The web app now supports gradual backend integration while maintaining stub fallbacks for local development. This architecture allows:

- **Local Development**: Run with stubs only (no backend required)
- **Staging**: Connect to real identity service with fallback
- **Production**: Real backend calls with graceful degradation

## Configuration

Backend integration is controlled via environment variables:

```env
# Service URL (defaults to localhost:3001)
NEXT_PUBLIC_IDENTITY_SERVICE_URL=https://identity-service.example.com

# Global toggle (defaults to false)
NEXT_PUBLIC_USE_REAL_BACKEND=true

# Feature-level toggles (all default to true/enabled)
NEXT_PUBLIC_ENABLE_REAL_DISCOVER=true
NEXT_PUBLIC_ENABLE_REAL_ENGAGEMENT=true
NEXT_PUBLIC_ENABLE_REAL_MESSAGING=true
NEXT_PUBLIC_ENABLE_REAL_TRUST=true
```

**Config File**: `apps/web/src/lib/backend-config.ts`

## Backend Endpoints Mapped

| Feature | Endpoint | Real Service | Stub Location |
|---------|----------|--------------|---------------|
| **Discover Feed** | `GET /discover/feed/:userId` | Identity Service | `/api/dashboard/discover` |
| **Engagement Dashboard** | `GET /engagement/dashboard/:userId` | Identity Service | Client-side stub |
| **Messaging Threads** | `GET /messaging/threads/:userId` | Identity Service | `/api/dashboard/messages` |
| **Trust Center Snapshot** | `GET /trust/center/:userId` | Identity Service | Client-side stub |

## API Route Structure

### Discover Route (`/api/dashboard/discover`)
**Location**: `apps/web/src/app/api/dashboard/discover/route.ts`

Flow:
1. Check if `ENABLE_REAL_DISCOVER` is true and `IDENTITY_SERVICE_URL` is set
2. If yes: Call `GET /discover/feed/:userId?mode=...&limit=...`
3. If backend succeeds: Return transformed backend response
4. If backend fails: Fall through to stub data
5. Return stub data with mode-based filtering

### Messages Route (`/api/dashboard/messages`)
**Location**: `apps/web/src/app/api/dashboard/messages/route.ts`

Flow:
1. Check if `ENABLE_REAL_MESSAGING` is true and `IDENTITY_SERVICE_URL` is set
2. If yes: Call `GET /messaging/threads/:userId?limit=...`
3. If backend succeeds: Return formatted response
4. If backend fails: Fall through to stub data
5. Return stub data with sorting support

### Engagement & Trust (Client-Side)
**Location**: `apps/web/src/lib/api.ts`

- `fetchEngagementDashboard()` — Checks `ENABLE_REAL_ENGAGEMENT`, calls backend or returns stub
- `fetchTrustSnapshot()` — Checks `ENABLE_REAL_TRUST`, calls backend or returns stub

## Implementation Pattern

Each integration follows this pattern:

```typescript
// Try real backend
if (BACKEND_CONFIG.ENABLE_REAL_[FEATURE] && BACKEND_CONFIG.IDENTITY_SERVICE_URL) {
  try {
    const url = getBackendUrl(`/[endpoint]/${userId}?...`);
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      // Transform if needed to match frontend types
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch from identity service, falling back to stubs:', error);
  }
}

// Fallback to stub data
return stubData;
```

## Local Development Workflow

```bash
# Run with stubs only (default - no backend required)
cd apps/web
npx next dev

# Run with real backend (requires identity service running on localhost:3001)
NEXT_PUBLIC_ENABLE_REAL_DISCOVER=true \
NEXT_PUBLIC_ENABLE_REAL_ENGAGEMENT=true \
NEXT_PUBLIC_ENABLE_REAL_MESSAGING=true \
NEXT_PUBLIC_ENABLE_REAL_TRUST=true \
npx next dev
```

## Local identity mock

The repository includes a simple express-style mock for the identity verification endpoints used during development. It listens on port 4002 by default and implements:

- POST /verifications -> create pending verification
- PATCH /verifications/:id/complete -> mark verified
- GET /verifications/:id -> fetch status

Quick start (Windows PowerShell):

```powershell
# start the mock (foreground)
npx ts-node services/identity/scripts/start-express-verification-mock.ts

# in a separate shell, start the web app pointed at the mock
powershell -ExecutionPolicy Bypass -File scripts/start-web-with-mock.ps1

# optionally run the integration script to validate flow
npx ts-node services/identity/scripts/integration-verification-flow-express.ts
```

If you prefer to avoid the helper script, set the following env variables before starting the web app:

```
NEXT_PUBLIC_IDENTITY_SERVICE_URL=http://localhost:4002
NEXT_PUBLIC_ENABLE_REAL_TRUST=true
```


## Deployed Environment Setup (Vercel)

Set environment variables in Vercel dashboard:

```
NEXT_PUBLIC_IDENTITY_SERVICE_URL=https://identity-api.example.com
NEXT_PUBLIC_USE_REAL_BACKEND=true
NEXT_PUBLIC_ENABLE_REAL_DISCOVER=true
NEXT_PUBLIC_ENABLE_REAL_ENGAGEMENT=true
NEXT_PUBLIC_ENABLE_REAL_MESSAGING=true
NEXT_PUBLIC_ENABLE_REAL_TRUST=true
```

## Error Handling

All backend calls are wrapped in try-catch:
- Network errors → Log and fallback to stubs
- Bad responses (non-2xx) → Log and fallback to stubs
- Timeout (default 30s) → Fallback to stubs

Users always see content (no "loading" state blocks UI).

## Type Alignment

Backend responses are validated against frontend types but remain flexible due to `[key: string]: any` in type definitions.

### Discover Feed Response
```typescript
{
  hero: DiscoverCard | null,
  featured: DiscoverCard[],
  grid: DiscoverCard[],
  filters: DiscoverFilterOption[],
  mode: DiscoverFeedMode,
  total: number,
  generatedAt: string,
}
```

### Messaging Threads Response
```typescript
{
  threads: MessagingThread[],
  total: number,
  hasMore: boolean,
  generatedAt: string,
}
```

## Next Steps

1. **Deploy Identity Service** to a public URL (e.g., identity-api.example.com)
2. **Update Environment Variables** in deployed web app
3. **Monitor Fallback Logs** to verify backend calls succeed
4. **Disable Stubs** when confident backend is stable (delete stub routes)

## Testing Locally

1. Start identity service:
   ```bash
   cd services/identity
   npm run dev
   ```

2. Start web app with backend enabled:
   ```bash
   cd apps/web
   NEXT_PUBLIC_IDENTITY_SERVICE_URL=http://localhost:3001 \
   NEXT_PUBLIC_ENABLE_REAL_DISCOVER=true \
   NEXT_PUBLIC_ENABLE_REAL_ENGAGEMENT=true \
   npx next dev
   ```

3. Navigate to Dashboard → Discover tab
4. Check browser console for backend fetch logs
5. Verify real data or stub fallback

---

**Architecture Date**: Feb 1, 2026  
**Status**: ✅ Ready for deployment  
**Maintenance**: Update `backend-config.ts` to add new service URLs or features
