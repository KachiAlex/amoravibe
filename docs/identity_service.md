# Identity Service (Phase 2)

## Overview

The Lovedate identity service coordinates onboarding, verification, policy enforcement, and moderation pipelines. Phase 2 focused on productionizing the verification backbone with a provider-agnostic KYC adapter, hardened webhook ingestion, and presigned upload support.

```
modules/
├─ onboarding          → collects user data, kicks off KYC via adapter
├─ kyc                 → provider abstraction, uploads, webhook validation
├─ verification        → persistence/auditing for verification sessions
├─ policy              → orientation-aware ABAC enforcement
├─ audit               → shared audit event logging
└─ device              → fingerprint ingestion and correlation (Phase 1/4)
```

## Verification Lifecycle

1. **OnboardingService** creates the user, then delegates to `KycAdapterService`.
2. **KycAdapterService** wraps `VerificationService.initiate`, then calls the injected `KycProvider.createVerification`. Any provider reference is persisted via `VerificationService.attachProviderReference`, reusing the `verification.reference` column for downstream reconciliation.
3. **KycProvider** interface (mock implementation in Phase 2) exposes:
   - `createVerification({ userId, verificationId })`
   - `getUploadTarget(generateUploadDto)` returning presigned S3 POST data
   - `parseWebhook(payload, context)` translating provider events into `KycCallbackPayload`
4. **KycService** receives sanitized payloads, maps provider statuses (`approved|pending|rejected`) into `VerificationStatus`, and calls `VerificationService.applyProviderDecision` while emitting audit logs and optional alerts.

## Upload Flow

- `/kyc/uploads` POST controller forwards `GenerateKycUploadDto` to the configured `KycProvider`.
- `KycUploadService` (used by the mock provider) enforces:
  - allow‑listed MIME types + file-size bounds (min/max bytes)
  - S3 key scheme `kyc/<userId>/<verificationId>/<purpose>/<timestamp>.<ext>`
  - TTL capped at 1 hour, metadata includes user, verification, purpose, optional label
- Configurable bucket + TTL sourced from `AppConfigService.kyc.uploadBucket` and `uploadTtlMinutes`.

## Webhook Flow & Security

1. `KycWebhookController` retrieves the raw payload plus `x-kyc-signature` / `x-kyc-timestamp` headers.
2. `KycWebhookService` guards the request:
   - `validateSignature` compares the header to `AppConfigService.kyc.webhookSecret`.
   - `validateTimestamp` enforces the tolerance window (`KYC_WEBHOOK_TOLERANCE_SECONDS`).
   - `sanitizePayload` ensures the provider matches the configured adapter, coerces metadata, and guarantees `verificationId` + status.
3. `KycProvider.parseWebhook` can perform provider-specific validation before handing off to `KycService`.

## Configuration Surface (`src/config/lovedate-config.ts`)

| Env Var                         | Description                                                   | Default                  |
| ------------------------------- | ------------------------------------------------------------- | ------------------------ |
| `KYC_PROVIDER`                  | provider slug stored on `Verification` rows + adapter binding | `persona`                |
| `KYC_API_BASE_URL`              | downstream provider base URL (mock only)                      | `https://mock-kyc.local` |
| `KYC_API_KEY`                   | provider credential (mock placeholder)                        | `mock-api-key`           |
| `KYC_WEBHOOK_SECRET`            | shared secret for webhook signature                           | `mock-webhook-secret`    |
| `KYC_WEBHOOK_TOLERANCE_SECONDS` | timestamp skew window (seconds)                               | `300`                    |
| `KYC_UPLOAD_BUCKET`             | S3 bucket for KYC uploads                                     | `lovedate-kyc-uploads`   |
| `KYC_UPLOAD_TTL_MINUTES`        | TTL for presigned URLs                                        | `30`                     |

`AppConfigService` exposes `kyc` and `getKycWebhookToleranceMs()` helpers for module injection.

## Testing Coverage

Phase 2 adds dedicated regression suites (Vitest):

- `tests/kyc/kyc-adapter.service.spec.ts` — ensures provider references persist and adapter handles missing references.
- `tests/kyc/kyc-webhook.service.spec.ts` — signature/timestamp validation, payload sanitation, provider gating.
- `tests/kyc/kyc.service.spec.ts` — callback handling, alert logic, verification transitions.
- `tests/verification/verification.service.spec.ts` — initiation + completion flows backed by `InMemoryPrismaService`.

All tests rely on `tests/utils/in-memory-prisma.service.ts`, which mimics Prisma delegates while satisfying the `PrismaClientLike` shape for DI.

## Future Hooks

- Swap `MockKycProvider` with a real adapter by binding a new provider implementation to `KYC_PROVIDER_TOKEN` in `KycModule`.
- Extend `KycAdapterService` with retry/backoff, upload coordination, and device fingerprint enrichment.
- Document orientation ABAC and device fingerprint pipelines once Phase 2+ deliverables land.
