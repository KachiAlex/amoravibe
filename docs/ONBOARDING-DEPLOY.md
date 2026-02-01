# Onboarding: local behavior and steps to deploy on cloud

Status

- Current implementation: client-only onboarding persisted in `localStorage`.
- Local onboarding flow succeeds because the browser runs client JS that calls `saveOnboarding()` and writes a user record to `localStorage`.

Why it worked locally

- `apps/web/src/lib/onboarding-context.tsx` exposes `saveOnboarding()` that writes `lovedate_onboarding` to `localStorage`.
- `apps/web/src/app/components/OnboardingModal.tsx` generates a mock `userId`, calls `saveOnboarding(...)`, shows success, and redirects to `/dashboard?userId=...`.
- No server call is required for the happy-path used during local development.

Files to keep (ensure present in production build)

- `apps/web/src/lib/onboarding-context.tsx` (localStorage provider)
- `apps/web/src/app/components/OnboardingModal.tsx` (submission UI)
- `apps/web/src/app/providers/OnboardingModalProvider.tsx` (wraps app with provider)

How to verify locally (matches cloud behavior)

1. From repo root run:
   - `npm install`
   - `npm --workspace=web run build`
   - `npm --workspace=web run start`
2. Open `http://localhost:3000`, complete onboarding — check browser devtools Application → Local Storage → `lovedate_onboarding`.
3. Navigate to `/dashboard?userId=<id>` to confirm redirect works.

Cloud deployment notes (quick, no-backend option)

- Deploy the same frontend bundle to Vercel/Netlify/GH Pages. The client-side onboarding will run in users' browsers and persist per-browser via `localStorage`.
- Pros: Fast, no backend changes; works offline in browser.
- Cons: Not shared across devices, not queryable by backend services, not recoverable if user clears storage.

Recommended long-term options

1. Server-backed onboarding (recommended)
   - Add a POST `POST /api/onboarding` endpoint to persist onboarding to the identity/profile service (DB).
   - Update `OnboardingModal.handleSubmit` to call server endpoint. On success, call `saveOnboarding()` and redirect.
   - Optional: accept `userId` returned by server so localStorage and server are in sync.
2. Hybrid / feature-flag approach (low-risk)
   - Add `NEXT_PUBLIC_ONBOARDING_MODE` with values `local|server|hybrid`.
   - `hybrid`: try server POST; on failure fallback to `localStorage`.
3. Publish `@lovedate/*` packages or inline required pieces so cloud builds do not fail due to file: workspace resolution.

CI / Deploy checklist (when ready to redeploy)

- Ensure `apps/web` build contains the onboarding provider and modal.
- Confirm `NEXT_PUBLIC_ONBOARDING_MODE` is set appropriately in Vercel (if using server mode).
- Run a production build locally and test (`npm --workspace=web run build` + `start`).
- Deploy and manually test onboarding flow in an incognito browser to validate localStorage persistence and redirect.

Support & debugging tips

- If onboarding does not persist in cloud, open browser devtools and check `localStorage` for the key `lovedate_onboarding`.
- For server-backed flows, check the network tab for `POST /api/onboarding` and inspect response codes.

If you want, I can:

- Implement `POST /api/onboarding` and update the modal to call it (PR), or
- Add the `NEXT_PUBLIC_ONBOARDING_MODE` feature-flag and fallback logic.

---

Recorded: 2026-02-01
