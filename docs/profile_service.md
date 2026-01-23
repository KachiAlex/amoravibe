# Profile Service — Phase 3 Blueprint

## Objectives

1. **Immutable verified attributes**: preserve government-verified fields (legal name, DOB, orientation, pronouns) with append-only history and audit trails.
2. **Media storage pipeline**: presigned uploads for profile media (photos/video snippets), backed by PII-safe S3 buckets + metadata enforcement.
3. **Orientation visibility controls**: enforce which traits/media are visible per discovery pool (hetero, LGBTQ, BOTH) while honoring ABAC rules from the identity service.

## High-Level Architecture

```
services/profile/
├─ src/
│  ├─ modules/
│  │  ├─ profile/          # immutable attributes, versioning, exposure rules
│  │  ├─ media/            # upload targets, moderation hooks, EXIF stripping
│  │  ├─ visibility/       # orientation gating + policy evaluation helpers
│  │  ├─ audit/            # thin wrapper delegating to identity/audit service
│  │  └─ messaging/        # (future) events for matching + notifications
│  ├─ config/
│  ├─ prisma/
│  └─ main.ts
└─ tests/
```

- Deploy as its own NestJS service co-located with `services/identity` but exposing a dedicated API surface consumed by discovery/matching.
- Shares Prisma schema via new models (`Profile`, `ProfileVersion`, `ProfileMedia`). Either extend existing DB or own schema + replication depending on infra constraints.

## Data Model (initial pass)

| Table                   | Purpose                                   | Key Fields                                                                                                                                                    |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------- |
| `Profile`               | canonical profile per `userId`            | `userId (FK)`, `handle`, `orientationVisibility`, `currentVersionId`, `createdAt`, `updatedAt`                                                                |
| `ProfileVersion`        | immutable snapshot of verified attributes | `profileId`, `legalName`, `displayName`, `bio`, `orientation`, `pronouns`, `lifestyleTags`, `verifiedAt`, `lockedBy`, `previousVersionId`                     |
| `ProfileMedia`          | metadata for uploaded assets              | `id`, `profileId`, `type (photo/video)`, `status (pending/approved/rejected)`, `visibility (public/pool-scoped)`, `storageKey`, `checksum`, `moderationFlags` |
| `ProfileVisibilityRule` | overrides for orientation pools           | `profileId`, `pool (hetero                                                                                                                                    | lgbtq | both)`, `visibleFields (JSON)`, `visibleMediaIds (JSON)` |

### Immutability Strategy

- `ProfileVersion` records are append-only. Updates create new version rows, reference them from `Profile.currentVersionId`.
- Enforce immutability via service layer + DB constraint (no UPDATE/DELETE on `ProfileVersion` except housekeeping job).
- Audit events emitted on every version create, referencing previous vs next diff for compliance review.

## API Surface (REST for v1)

| Endpoint                                        | Method         | Description                                                           | Auth                              |
| ----------------------------------------------- | -------------- | --------------------------------------------------------------------- | --------------------------------- |
| `/profiles/:userId`                             | GET            | Fetch profile with visibility-filtered payload                        | Internal (matching/discovery)     |
| `/profiles/:userId`                             | POST           | Bootstrap profile after identity onboarding                           | Internal (identity)               |
| `/profiles/:userId/versions`                    | POST           | Submit profile edits (creates pending version)                        | User-auth with verification token |
| `/profiles/:userId/versions/:versionId/approve` | POST           | Approve + lock version (requires trust agent)                         | Internal (risk ops)               |
| `/profiles/:profileId/media/uploads`            | POST           | Request presigned upload for photo/video, persists `ProfileMedia` row | User-auth                         |
| `/profiles/:profileId/media/:mediaId/complete`  | POST           | Mark upload complete, transition to `processing`                      | User-auth + policy check          |
| `/profiles/:profileId/visibility/rules`         | GET            | List all pool overrides for a profile                                 | Internal (matching/discovery)     |
| `/profiles/:profileId/visibility/rules/:pool`   | GET/PUT/DELETE | CRUD operations on per-pool field/media overrides                     | Internal (matching/discovery)     |
| `/profiles/:profileId/visibility/pools/:pool`   | GET            | Deterministic payload for requested visibility pool                   | Internal (matching/discovery)     |

GraphQL wrapper can be added later for richer clients but REST keeps parity with current services.

## Media Pipeline

1. Client requests upload target specifying media type, intended pool visibility, and labels (e.g., "primary_photo").
2. `MediaUploadService` issues presigned POST/PUT (similar to Phase 2 KYC) with strict MIME/size/exif stripping instructions.
3. After upload, client calls `POST /media/:id/complete` to finalize; service queues moderation job (device fingerprint pipeline can reuse hooks).
4. Approved media becomes referenceable in `ProfileVersion` snapshots (store `mediaIds` array for ordering).

### Implementation details (Phase 3)

- **Module wiring**: `MediaModule` imports the local `ConfigModule` + `PrismaModule`, exposing `MediaController` + `MediaService`.
- **Request DTO** enforces runtime enums for `type`, `visibility`, `contentType`, and file extensions. Config-driven size/MIME limits live in `ProfileConfigService.media`.
- **POST `/profiles/:profileId/media/uploads`**
  - Validates profile existence, asserts MIME prefix, generates a presigned POST via AWS SDK v3.
  - Persists a `ProfileMedia` row with `pending` status, desired visibility pool, label, and metadata (requestedAt, contentType).
  - Response extends the presign payload with `mediaId`, bucket/key, TTL ISO timestamp, and requested visibility for clients to track status.
- **POST `/profiles/:profileId/media/:mediaId/complete`**
  - Ensures media belongs to the profile and is still `pending`.
  - Updates status -> `processing`, attaches checksum + moderation context, and records completion timestamp.
  - Moderation + approval pipelines can later flip status to `approved`/`rejected`, unlocking visibility exposure.

All AWS requests are mocked in Vitest via `@aws-sdk/client-s3` + `@aws-sdk/s3-presigned-post` stubs to keep tests hermetic.

## Orientation Visibility Controls

- Ingest `orientation` + `discoverySpace` rules from identity service.
- `VisibilityPolicyService` composes:
  - Global ABAC rules (straight users -> hetero pool only).
  - Profile-specific overrides (e.g., hide certain answers from hetero pool).
- Provide deterministic filter util returning `VisibleProfilePayload` per requested pool to avoid leaking restricted fields.

### Implementation details (Phase 3)

- **VisibilityModule** wires `VisibilityController` + `VisibilityService`, reusing Prisma + config modules.
- **Rule CRUD**: `GET/PUT/DELETE /profiles/:profileId/visibility/rules/:pool` upserts JSON arrays of `visibleFields` and `visibleMediaIds`. Absent overrides fall back to `DEFAULT_VISIBLE_FIELDS` and approved media matched by requested pool.
- **Pool snapshots**: `GET /profiles/:profileId/visibility/pools/:pool` fetches the latest locked profile version, approved media (ordered by creation), applies pool overrides, and returns `VisibleProfilePayload { fields, media }` used by discovery service.
- **Safeguards**: every handler asserts the profile exists, throws `404` for missing records, and shields other pools by defaulting to hetero-only exposure unless ABAC + overrides explicitly allow otherwise.

## Integrations

- **Identity Service**: receives events (`profile.created`, `profile.version.locked`) and provides verification status to gate edits.
- **Matching Service (Phase 3)**: consumes filtered profiles via internal API or message bus topic (`profile.visibility.snapshot`).
- **Moderation**: existing device/mod pipelines subscribe to `profile.media.flagged` to escalate cases.

## Testing Strategy

1. Unit tests for versioning logic, diff generation, and immutability guards.
2. Upload route tests verifying TTL, headers, and rejection of disallowed media.
3. Visibility policy tests ensuring hetero/LGBTQ/BOTH payloads respect restrictions.
4. Integration tests using in-memory Prisma to simulate profile creation + media attachments, asserting audit events emitted.

### Current regression coverage

- `services/profile/tests/media/media.service.spec.ts`
  - Mocks AWS presign helpers and Prisma writes to ensure upload requests persist correct metadata and respect MIME limits.
  - Verifies completion flow rejects non-pending media and transitions approved uploads to `processing` with checksums + moderation context.
- `services/profile/tests/visibility/visibility.service.spec.ts`
  - Ensures default field list is applied when no overrides exist and that media filtering honors approval status + pool-specific visibility.
  - Validates override behavior for bespoke pools (e.g., only `bio` for LGBTQ, restricted media IDs).

Additional identity-service parity tests remain applicable for ABAC/Orientation policies; future work will add end-to-end smoke tests once matching service integration lands.

## Next Steps

1. Scaffold `services/profile` NestJS app + Prisma schema.
2. Implement Profile + ProfileVersion models/migrations.
3. Build versioning service + REST endpoints.
4. Wire media upload service (reuse AWS presign helper or abstract into shared lib).
5. Implement visibility policy layer and tests.
6. Author developer docs + runbooks covering migration strategy and API usage.
