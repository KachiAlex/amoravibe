# Implementation To-Do List

> Version 0.1 — focused on authenticity-first dating platform foundations.

## Phase 0 — Product & Compliance Alignment

- [ ] Capture detailed product requirements (personas, hetero + LGBTQ flows, trust guardrails).
- [ ] Legal & compliance review (KYC requirements per region, data residency, LGBTQ protections).
- [ ] Risk assessment for impersonation, harassment, data breaches; document mitigations.

## Phase 1 — Repository & Infrastructure Foundations

- [x] Adopt monorepo toolchain (pnpm + Turbo) and initialize workspace folders (apps/, services/, packages/).
- [x] Add shared TypeScript config, linting, formatting, pre-commit hooks.
- [x] Provision IaC baseline (Terraform) for core environments (dev/stage/prod) and secrets management.
- [x] Bootstrap Observability stack definitions (OpenTelemetry collector, log aggregation, dashboards).

## Phase 2 — Identity & Verification Backbone

- [ ] Identity service (NestJS) with user entity, verification state machine, and audit trails.
- [ ] Integrate third-party KYC/biometric provider; support government ID + selfie/video flows.
- [ ] Implement orientation-aware policy engine (ABAC rules) enforcing hetero/LGBTQ segmentation.
- [ ] Device fingerprinting + multi-account detection pipelines.

## Phase 3 — Profile, Matching, and Messaging

- [ ] Profile service with immutable verified attributes, media storage, and orientation visibility controls.
- [ ] Matching service (Rust or Go) delivering preference queues per orientation pool.
- [ ] Messaging service (WebSocket + queue) with E2EE support and safety keyword detection hooks.
- [ ] Notification service for email/SMS/push with templating + localization.

## Phase 4 — Trust, Moderation, and Analytics

- [x] Moderation service with case management UI, reporting pipeline, and automation rules.
- [x] ML safety models (Torch/TF placeholder via heuristic engine) for behavior anomaly detection and impersonation signals.
- [x] Centralized audit/event log with retention policy + privacy tooling (export/delete requests).
- [x] Analytics warehouse ingestion + schema (PII segmentation ready for warehouse exports).
- [x] Analytics dashboards + privacy-reviewed reporting surfaces (tier guard, audit logging, leadership report endpoint).

## Phase 5 — Client Applications

- [ ] Next.js web app with onboarding + verification wizard, profile management, trust center.
- [ ] React Native (Expo) mobile apps mirroring flows with biometric prompts.
- [ ] Design system (tokens, components) shared across web/mobile.

### Trust Dashboard & Communities Workstream

- [ ] Wire up dashboard data fetching to identity snapshot API (server-side) to avoid placeholder states.
- [ ] Polish hero section (trust score badge, verification chip, ambient motion) matching existing gradient theme.
- [ ] Build action progress rail (verification, devices, risk) with deep links into sections.
- [ ] Upgrade metric cards with trend sparklines + consistent timestamps.
- [ ] Expand risk + devices panels (filters, device badges, "Pair device" CTA).
- [ ] Group moderation log + audit summary with accordions and quick actions.
- [ ] Introduce Communities section (trust tier cards, eligibility checklist, invite carousel).
- [ ] Add support footer + contact CTA aligned with AmoraVibe style.

### Dashboard Tabs Implementation

- [ ] **Home / Main Feed** – Build profile card stack with like/pass/save/super-like handlers, enforcing orientation + visibility rules.
- [ ] **Explore / Discover** – Add Nearby/New/Active/Verified tabs, advanced filters (height, lifestyle, intent, education, online) with premium gating.
- [ ] **Matches hub** – Render mutual matches grid with status pills (new/active/expiring) and actions (chat, unmatch, block/report).
- [ ] **Messages inbox** – Create chat list with previews + timestamps and link into dedicated conversation view; ensure no-chat-before-match guard.
- [ ] **Likes surfaces** – Separate "You liked" vs "Liked you" plus premium upsells (see who liked you, instant match, rewind last swipe).
- [ ] **Profile management** – Provide edit surface for photos, prompts, lifestyle tags, gender/orientation, visibility controls, completeness meter.
- [ ] **Verification & Trust** – Integrate selfie/ID verification flows, badge display, history timeline, and re-verification triggers.
- [ ] **Notifications center** – Surface match/message/like/safety alerts with push/email toggle controls and quiet hours.
- [ ] **Premium & Boosts** – Add boost/super-like cards, advanced filter paywalls, subscription management (plans, history, upgrade/cancel).
- [ ] **Safety & Support** – Embed reporting entrypoints, blocked list, safety tips, guidelines, help/FAQ, contact support CTA.
- [ ] **Settings** – Implement account, password/security, privacy, location/distance, orientation update flow, pause/delete account actions.

## Phase 6 — Launch Readiness

- [ ] Penetration testing & security audit.
- [ ] Chaos testing & load testing for peak matchmaking/chat traffic.
- [ ] Run beta program with staged rollout + feedback loops.

---

**In Progress:** Phase 5 — Client applications + trust center UI.
