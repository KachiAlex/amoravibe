# Phase 2 — Identity & Verification Backbone

## Goals

1. Stand up an identity service (NestJS) that persists user records, verification state, and audit trails.
2. Integrate with a KYC/biometric vendor to support government ID + selfie/video submissions.
3. Enforce orientation-aware access policies (ABAC) separating hetero vs LGBTQ discovery lanes.
4. Detect device fingerprint anomalies and multi-account behavior.

## Scope Breakdown

### 1. Identity Service (NestJS)

- [ ] Generate `services/identity` NestJS module scaffold (`identity` feature module, Prisma entity or TypeORM depending on repo standards).
- [ ] Entities:
  - `User`: core profile, auth identifiers, onboarding progress, orientation metadata.
  - `VerificationSession`: status (`pending`, `submitted`, `approved`, `failed`), references KYC provider responses.
  - `AuditEvent`: records sensitive actions (orientation edits, verification approvals, policy triggers).
- [ ] GraphQL/REST endpoints (to be finalized) enabling:
  - User creation from onboarding flow.
  - Verification status retrieval.
  - Admin trust agent actions (approve/reject, request re-upload).
- [ ] Hook into existing onboarding form submission to persist data + emit events for downstream services.

### 2. KYC / Biometric Integration

- [ ] Vendor evaluation (e.g., SmileID, Onfido). For mock phase, create adapter interface + stub provider returning deterministic responses.
- [ ] Support document types: passport, national ID, driver license; capture region requirements from Phase 0 doc.
- [ ] Selfie/video capture flow: generate signed URLs for uploads, store temporary references in S3 (PII bucket) with short TTL.
- [ ] Webhook receiver for provider decisions → update `VerificationSession` and fire notifications.
- [ ] Rate limiting + retry policy for provider API calls.

### 3. Orientation-Aware Policy Engine

- [ ] Define ABAC rules: attributes include `user.orientation`, `user.discovery_space`, `requested_action`.
- [ ] Implement enforcement middleware used by discovery/match endpoints to route requests to correct pools.
- [ ] Maintain change-log requiring support approval before orientation/space updates (ties to AuditEvent table).
- [ ] Provide policy unit tests covering hetero-only, queer-only, both spaces.

### 4. Device Fingerprinting & Multi-Account Detection

- [x] Capture device identifiers during onboarding/login (UA string hash + optional fingerprintJS vendor).
- [x] Store `DeviceFingerprint` records linked to `User` with derived `riskLabel`.
- [x] Emit Moderation events + AuditService logs when high-turnover or spoofing alerts trigger (see `DeviceService.ingest`).
- [x] Hourly correlation job scans shared fingerprints/IP clusters and emits linked-account moderation events (see `DeviceCorrelationService`).
- [ ] Background job comparing shared devices/IPs → flag suspicious clusters and emit Moderation events.
- [x] Support API (`GET /devices/clusters`, `/devices/clusters/:hash`) to review linked accounts.

## Deliverables

1. `docs/identity_service.md` — API/DB schema reference (to be authored after implementation).
2. Updated services/identity code with modules, entities, and mock KYC adapter.
3. Terraform secrets placeholders for KYC provider keys + webhooks.
4. Unit/integration tests verifying verification state transitions, policy enforcement, and device moderation alerts/cluster surfacing (see `tests/device/device.service.spec.ts`).

## Dependencies

- Phase 1 Terraform outputs (buckets, subnets) for storage + eventual deployment.
- Observability stack to emit metrics/logs around verification success rates.

## Timeline (Rough)

- Week 1: Service scaffolding + DB schema, audit events.
- Week 2: Mock KYC adapter + webhook flow + policy engine.
- Week 3: Device fingerprinting pipeline, moderation hooks, finalize documentation/tests.
