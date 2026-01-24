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

| Env Var                             | Description                                                   | Default                                         |
| ----------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| `KYC_PROVIDER`                      | provider slug stored on `Verification` rows + adapter binding | `persona`                                       |
| `KYC_API_BASE_URL`                  | downstream provider base URL (mock only)                      | `https://mock-kyc.local`                        |
| `KYC_API_KEY`                       | provider credential (mock placeholder)                        | `mock-api-key`                                  |
| `KYC_WEBHOOK_SECRET`                | shared secret for webhook signature                           | `mock-webhook-secret`                           |
| `KYC_WEBHOOK_TOLERANCE_SECONDS`     | timestamp skew window (seconds)                               | `300`                                           |
| `KYC_UPLOAD_BUCKET`                 | S3 bucket for KYC uploads                                     | `lovedate-kyc-uploads`                          |
| `KYC_UPLOAD_TTL_MINUTES`            | TTL for presigned URLs                                        | `30`                                            |
| `ANALYTICS_DB_URL`                  | Postgres replica/warehouse used by analytics ingestion        | `postgresql://localhost:5432/lovedate_identity` |
| `PII_HASH_SALT`                     | Salt prepended before hashing identifiers for analytics facts | `local-dev-salt`                                |
| `ANALYTICS_SNAPSHOT_WINDOW_MINUTES` | Sliding window (minutes) used for user snapshot alignment     | `60`                                            |

`AppConfigService` exposes `kyc` and `getKycWebhookToleranceMs()` helpers for module injection.

### Analytics Warehouse & Dashboards (Phase 4)

Phase 4 introduces an analytics warehouse pipeline and dashboard APIs to power trust reporting while respecting PII segmentation:

1. **`AnalyticsIngestionService`** runs on a schedule (via cron/queue) and orchestrates three pipelines:
   - `snapshotUsers` captures user attributes updated within the configured window, hashing email/phone via `sha256(salt + value)` and storing preference metadata under the `hashed` tier.
   - `ingestTrustSignals` streams `RiskSignal` rows into `AnalyticsTrustSignalFact`, deriving hashed user IDs and tagging each record with the correct PII tier (`direct` when a user reference exists, else `aggregate`).
   - `ingestModerationEvents` mirrors moderation facts, preserving severity/message while hashing identifiers.
2. **Checkpointing** is persisted in `AnalyticsIngestionRun` so incremental loads resume from the last successful timestamp per job (`analytics-user-snapshots`, `analytics-trust-signals`, `analytics-moderation-events`).
3. **PII Tiering**
   - `direct`: includes userId for privileged analysts.
   - `hashed`: salted hashes only, for cross-system correlation without direct identifiers.
   - `aggregate`: no user reference; suitable for public reporting.
4. **Configuration** leverages the new env vars above and is surfaced through `AppConfigService.analytics` for modules/tests.

Vitest coverage (`tests/analytics/analytics-ingestion.service.spec.ts`) exercises all three pipelines against the in-memory Prisma mock to guarantee hashing, tier assignment, and checkpoint behavior.

#### Dashboard API Contract

`GET /analytics/dashboard`

| Query Param             | Required | Description                                                                  |
| ----------------------- | -------- | ---------------------------------------------------------------------------- |
| `startDate` (ISO-8601)  | ✅       | Inclusive range start used for snapshots, signals, and moderation facts.     |
| `endDate` (ISO-8601)    | ✅       | Inclusive range end (must be >= `startDate`).                                |
| `maxPiiTier`            | ❌       | Limits returned data to tiers `<=` the supplied value (default `aggregate`). |
| `orientation`           | ❌       | Filters `AnalyticsUserSnapshot` rows before computing trust health metrics.  |
| `timezoneOffsetMinutes` | ❌       | Shifts day-bucket aggregation when building daily time-series (default `0`). |

Response (`AnalyticsDashboardResponse`):

```jsonc
{
  "window": { "startDate": "2024-01-01", "endDate": "2024-01-07", "maxPiiTier": "hashed" },
  "trustHealth": {
    "snapshotCount": 1024,
    "verifiedRate": 67.2,
    "averageTrustScore": 74,
    "orientationBreakdown": [{ "orientation": "heterosexual", "percentage": 58.1 }],
  },
  "trustSignals": {
    "total": 342,
    "bySeverity": [{ "severity": "high", "count": 12 }],
    "byChannel": [{ "channel": "device", "count": 44 }],
    "trend": [{ "date": "2024-01-03", "total": 19, "critical": 2 }],
  },
  "moderation": {
    "total": 91,
    "bySeverity": [{ "severity": "critical", "count": 7 }],
    "trend": [{ "date": "2024-01-05", "total": 11, "critical": 3 }],
  },
}
```

The controller validates requests with `AnalyticsDashboardQueryDto`, which enforces ISO-8601 window bounds, optional orientation filtering, and tier gating via `AnalyticsPiiTier`. The service returns only the allowed tiers (aggregate → hashed → direct) to ensure privacy-aware dashboards.

#### Access Control & Audit

- Both `/analytics/dashboard` and `/analytics/leadership-report` require:
  - `x-analytics-tier`: one of `aggregate`, `hashed`, `direct`; governs the maximum PII tier returned.
  - `x-analytics-actor-id`: unique identifier for the analyst/role; used for audit logging.
- `AnalyticsTierGuard` enforces headers, prevents tier escalation (query tier cannot exceed header tier), and injects context.
- `AnalyticsController` logs each access via `AuditService` using `AuditAction.ANALYTICS_DASHBOARD_ACCESSED` with request metadata (window, orientation, report type).

`GET /analytics/leadership-report`

- Returns aggregate-only metrics suitable for leadership/legal briefs.
- Always forces `maxPiiTier=aggregate` regardless of caller tier.
- Response matches `AnalyticsLeadershipReport` (counts + severity percentages, no hashed identifiers).

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
