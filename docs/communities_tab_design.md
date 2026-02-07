# Communities Platform — Data Model & API Contracts

## Goals & Guardrails
- Communities augment (not replace) matching; orientation boundaries and DM policies remain enforced by backend policy checks.
- Every rule (eligibility, moderation, visibility) is enforced server-side; UI only reflects state.
- Trust & safety signals (reports, moderation actions, profile health) feed eligibility, discovery ranking, and community standing metrics.

## Data Model Changes (Prisma)
### `Community`
| Field | Type | Description |
| --- | --- | --- |
| `slug` | `String @unique` | SEO / share identifier. |
| `category` | `CommunityCategory` | interest / identity / location / event / verified_only. |
| `entryRequirements` | `Json` | Serialized rules (min trust, verification, gender/orientation constraints, invite-only, location radius, etc.). |
| `allowedInteractions` | `Json` | Feature toggles per community (posts, comments, reactions, media, events). |
| `isVerifiedOnly` | `Boolean @default(false)` | Forces verification + trust minimum. |
| `frozenAt` | `DateTime?` | When admins freeze activity (posts blocked). |
| `frozenReason` | `String?` | Why the community is frozen. |
| `archivedReason` | `String?` | Auditable archive reason. |
| `lastActivityAt` | `DateTime?` | For sorting / retention metrics. |

### `CommunityMember`
| Field | Type | Description |
| --- | --- | --- |
| `status` | `CommunityMembershipStatus` | pending / active / muted / banned / left. |
| `joinedVia` | `CommunityEntryType` | organic, invite, auto, staff. |
| `eligibilitySnapshot` | `Json?` | Stored rationale when approved / rejected. |
| `lastSeenAt` | `DateTime?` | Activity tracking. |
| `mutedUntil` | `DateTime?` | Soft restriction. |
| `banExpiresAt` | `DateTime?` | Temporary bans. |
| `flagsCount` | `Int @default(0)` | Automated kicks/escalations. |

### `CommunityPost`
| Field | Type | Description |
| --- | --- | --- |
| `mediaCount` | `Int @default(0)` | Asset count. |
| `visibility` | `CommunityPostVisibility` | everyone / members-only / moderators. |
| `safetyReviewState` | `SafetyReviewState` | pending / clean / escalated / removed. |
| `softDeletedBy` | `String?` | Moderator ID. |

### `CommunityPostMedia` *(new)*
Stores per-post media metadata for moderation.
```
model CommunityPostMedia {
  id          String   @id @default(uuid())
  postId      String
  url         String
  mimeType    String
  width       Int?
  height      Int?
  createdAt   DateTime @default(now())

  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
}
```

### `CommunityModerationLog` *(new)*
Detailed community-level moderation (ties into `SafetyReport`). Tracks freeze/archive decisions, user removals, etc.
```
model CommunityModerationLog {
  id            String   @id @default(uuid())
  communityId   String
  actorId       String // admin/mod
  targetUserId  String?
  action        CommunityModerationAction
  reason        String
  metadata      Json?
  createdAt     DateTime @default(now())

  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  actor     User       @relation("CommunityModerations", fields: [actorId], references: [id], onDelete: Cascade)
}
```

### `CommunityPostReport` *(new)*
Links community posts/comments to safety pipeline with evidence & statuses.
```
model CommunityPostReport {
  id          String     @id @default(uuid())
  postId      String
  reporterId  String
  reason      ReportReason
  status      ReportStatus @default(submitted)
  description String?
  evidence    Json?
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?

  post     CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  reporter User          @relation(fields: [reporterId], references: [id], onDelete: Cascade)
}
```

### Enums
```
enum CommunityCategory { interest identity location campus event verified_only }
enum CommunityMembershipStatus { pending active muted banned left }
enum CommunityEntryType { organic invite auto staff }
enum CommunityPostVisibility { everyone members moderators }
enum SafetyReviewState { pending clean escalated removed }
enum CommunityModerationAction { freeze unfreeze archive restore kick ban warn }
```

## Eligibility & Enforcement Rules
- **Orientation boundaries**: `entryRequirements.orientation` holds allowed orientations and gender pairings; joins/posts enforce via server check referencing user profile fields.
- **Verification & trust**: `isVerifiedOnly` and `entryRequirements.minTrustScore` ensure only qualified users join/post; membership status becomes `pending` if under review.
- **Location-based**: `entryRequirements.location` may specify geo fence (city slug, radius). Resolved via user profile location snapshot at join time.
- **DM guardrails**: API never exposes direct contact channels; UI can only show member list (subject to `allowedInteractions.viewMembers`).
- **Freeze/archive**: `frozenAt` prevents post/comment mutations; moderators recorded via `CommunityModerationLog`.

## API Contracts (REST, Nest)
Base path: `/api/v1/communities`

### Browse & Detail
- `GET /browse?userId=uuid&type=interest&category=fitness&search=...&limit=20&cursor=...`
  - **Response**: `{ "communities": [ { id, name, slug, category, verified, memberCount, userRole, eligibility: { allowed: true|false, reasons: [] } } ], "page": { "nextCursor": string|null } }`
  - Eligibility computed server-side; disallowed communities include `eligibility.reasons` (e.g., "Verification required").
- `GET /:communityId`
  - Returns metadata, entry requirements (sanitized), moderation state, preview of latest posts (3) if allowed.

### Membership
- `POST /:communityId/join`
  - Body: `{ "userId": string, "context": { "intent": "discover" } }`
  - Validates eligibility; returns `{ status: "active"|"pending"|"banned", eligibility }`.
- `POST /:communityId/leave`
  - Body: `{ "userId": string }`; updates member count and logs.
- `POST /:communityId/mute`
  - Body: `{ "userId": string, "muted": boolean }` for self-mute.
- `GET /:communityId/members?userId=...&limit=50`
  - Returns anonymized list when `allowedInteractions.viewMembers` true; otherwise summary counts only.

### Posts & Interactions
- `GET /:communityId/posts?userId=...&cursor=...`
  - Respects membership + freeze state; returns `{ posts: [ { id, author, content, media, metrics, reactions, safetyReviewState } ], page }`.
- `POST /:communityId/posts`
  - Body: `{ "userId": string, "content": string, "media": [{ url, mimeType, width, height }] }`.
  - Applies rate limits, profanity / safety scan, DM restrictions.
- `POST /:communityId/posts/:postId/comments`
  - Body: `{ "userId": string, "content": string }`.
- `POST /:communityId/posts/:postId/react`
  - Body: `{ "userId": string, "type": "like"|"support"|... }`.
- `POST /:communityId/posts/:postId/report`
  - Body: `{ "userId": string, "reason": ReportReason, "description"?: string, "evidence"?: string[] }`.
  - Writes to `CommunityPostReport` + `SafetyReport`, returns tracking id.

### Admin / Moderation
- `POST /:communityId/freeze`
  - Body: `{ "actorId": string, "reason": string }` (requires moderator role); sets `frozenAt` and logs action.
- `POST /:communityId/unfreeze`
- `POST /:communityId/archive`
  - Body includes `reason`, `actorId`; sets `archivedAt` + `archivedReason`.
- `POST /:communityId/members/:memberId/ban`
  - Body: `{ "actorId": string, "durationMinutes"?: number, "reason": string }`; updates member status + logs.
- `GET /:communityId/moderation-logs?limit=50`
  - Auditable feed for moderators & Safety Center.

### Eligibility Preview API (new)
- `POST /eligibility`
  - Body: `{ "userId": string, "communityIds": string[] }`
  - Response: `{ "results": { [communityId]: { allowed: boolean, reasons: string[] } } }`
  - Used by UI to gray out communities before join attempt.

### Safety Integrations
- `POST /:communityId/posts/:postId/report` (above) triggers `SafetyService.submitReport` to keep a unified moderation queue.
- Member bans/flags update `ProfileHealthScore` via Safety service.
- `allowedInteractions.locationSharing` and `entryRequirements.emergencyContactRequired` tie into Safety center toggles.

## API Client (web)
Add typed helpers in `packages/api` & `apps/web/src/lib/api.ts`:
- `lovedateApi.listCommunities({ userId, filters })`
- `lovedateApi.joinCommunity({ communityId, userId })`
- `lovedateApi.listCommunityPosts({ communityId, userId, cursor })`
- `lovedateApi.createCommunityPost({ communityId, userId, content, media })`
- `lovedateApi.reportCommunityPost({ communityId, postId, userId, reason, description, evidence })`
- `lovedateApi.getCommunityMembers({ communityId, userId })`

## Compliance & Logging
- Every mutation writes to `CommunityModerationLog` + optional `SafetyReport` ID for traceability.
- `entryRequirements` stored JSON persists decision made at join time; hashed snapshot kept in `CommunityMember.eligibilitySnapshot` for audits and appeals.
- GDPR support: `CommunityMember` deletions cascade; logs maintain only actor IDs + reasons.

## Deliverables for Implementation
1. Update Prisma schema + regenerate client.
2. Expand `CommunitiesService` with eligibility evaluators, moderation endpoints, rate limits.
3. Wire new REST routes + DTOs (Nest controllers) with Zod/Joi validation.
4. Update `lovedateApi` client + add UI tab consumer once backend endpoints stabilize.
