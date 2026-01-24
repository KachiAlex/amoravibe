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

## Phase 6 — Launch Readiness

- [ ] Penetration testing & security audit.
- [ ] Chaos testing & load testing for peak matchmaking/chat traffic.
- [ ] Run beta program with staged rollout + feedback loops.

---

**In Progress:** Phase 5 — Client applications + trust center UI.
