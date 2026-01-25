# Phase 5 – Client Applications & Trust Center UI

## Objectives

1. Deliver end-user experiences for web and mobile that showcase the identity/trust stack built in Phases 1–4.
2. Provide a unified trust center that surfaces verification status, device security signals, moderation activity, and analytics disclosures.
3. Establish a shared design system (tokens + components) to ensure parity between Next.js web and Expo mobile apps.

## High-Level Deliverables

| Track         | Deliverable                                              | Notes                                                                                           |
| ------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Web           | Next.js 14 (App Router) app deployed on Vercel           | SSR onboarding flow, verification wizard, trust center dashboard.                               |
| Mobile        | Expo (React Native) app                                  | Mirrors onboarding + verification, includes device prompts (biometric + trusted device checks). |
| Design System | Token file, primitive components, storybook-like catalog | Shared via `packages/ui` consumed by `apps/web` & `apps/mobile`.                                |

## Personas & Journeys

1. **New User**
   - Sign-up → orientation selection → onboarding questionnaire.
   - Mandatory identity verification via embedded Persona/TBD flow.
   - Device registration + biometric setup.
2. **Returning User**
   - Sees trust center with verification badge, risk score summary, and recent moderation/audit actions (read-only from identity service APIs).
   - Can request data export or trigger deletion -> hits existing audit endpoints.
3. **Trust Ops / Support (Internal)**
   - Access internal dashboard (Phase 4) but also uses client apps for “impersonation view.” Needs feature flag to switch persona.

## API Touchpoints

- `services/identity` (existing): auth, verification, KYC upload, trust center data, analytics dashboards (read-only for aggregate surfaces).
- `services/moderation`: report submission API, case status.
- `services/profile`: (TBD) for media & preferences.

## Architecture Sketch

- `apps/web`: Next.js, uses `packages/config` for env typing, `packages/ui` for components, `packages/api` (to be created) for typed data fetching.
- `apps/mobile`: Expo + React Navigation; reuse `packages/ui` primitives via React Native Web-compatible components.
- `packages/ui`:
  - Theme tokens (color, spacing, typography).
  - Components: Button, Input, Stepper, Card, TrustBadge, DeviceList, RiskTrend chart placeholder.
- Auth handled via existing identity service (OAuth or custom JWT). Need SSR helpers + React Query for hooks.

## Milestones

1. **Scaffolding & Tooling**
   - Create `apps/web` (Next.js) and `apps/mobile` (Expo) directories if not already present.
   - Initialize shared ESLint/Prettier config for frontend stacks.
   - Add Storybook or Ladle inside `packages/ui` for visual regression.
2. **Onboarding + Verification**
   - Multi-step onboarding wizard with progress persistence (localStorage + API).
   - Verification handoff using existing `/identity/verification` endpoints (presigned uploads, webhook status polling).
   - Device registration: capture device fingerprint and send to identity service.
3. **Trust Center**
   - Dashboard cards: Verification status, risk score trend, device list, recent moderation events (read-only from analytics + audit services).
   - “Request export/delete” buttons invoking audit service endpoints with confirmation modals.
   - Notifications for pending actions (e.g., “verification retry required”).
4. **Mobile Parity**
   - Implement onboarding + trust center screens in Expo app with navigation stack.
   - Integrate device biometrics (FaceID/TouchID) gating trust center entry.
   - Push notifications placeholder hooking into future notification service.
5. **Design System Hardening**
   - Token definitions exported as JSON/TS.
   - Theming support (light/dark) and responsive primitives.
   - Accessibility: focus management, semantic roles.

### Latest progress

- Shared API client now exposes `fetchOnboardingStatus` with typed `OnboardingStatusResponse`/`OnboardingStep` DTOs.
- Mobile onboarding screen consumes that endpoint through the shared client, including loading/error states and tagged step badges that mirror Lovedate tokens.
- Added path aliases in the Expo tsconfig so `@lovedate/api` and `@lovedate/ui` resolve without local build output, ensuring type safety during development.
- Next.js trust center route (`/trust-center`) now ships with server-rendered data from the Lovedate API plus dedicated loading/error boundaries so the surface gracefully transitions while the snapshot loads.
- Identity service now exposes `/audit/privacy/exports` + `/purges` endpoints guarded by an audit API key with DTO validation and audit logging for export/deletion actions.
- Shared API client + Next.js server actions gained `requestAuditExport`/`requestAuditPurge` helpers, and the web trust center UI now renders a `PrivacyActionsPanel` that submits those actions with optimistic feedback and user-friendly messaging.

## Privacy & Security Considerations

- Ensure analytics dashboard APIs remain server-side only; client trust center should consume user-specific endpoints (no raw analytics data).
- Apply rate limiting & CSRF protections on data export/delete requests initiated from clients.
- Use secure storage for tokens on mobile (Expo SecureStore).
- Feature flag internal impersonation mode; ensure audit logging when toggled.

## Success Criteria

- Phase 5 checklist items (web app, mobile app, design system) marked complete.
- Trust center displays live data from identity/moderation services in staging.
- All new endpoints documented; Storybook snapshots for shared components; automated tests for onboarding workflow.
