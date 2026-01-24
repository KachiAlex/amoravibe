# Phase 4 Analytics Dashboards & Privacy Surfaces

## Objectives

- Provide Trust & Safety teams with near real-time visibility into trust health, risk signals, and moderation pipelines.
- Maintain strict segregation of PII via tiered access (aggregate → hashed → direct) with auditable queries.
- Offer privacy-reviewed reporting surfaces that can feed leadership briefings, compliance packs, and crisis playbooks.

## Personas & Access Tiers

| Persona              | Example Roles                  | Allowed PII Tier | Notes                                                  |
| -------------------- | ------------------------------ | ---------------- | ------------------------------------------------------ |
| Trust Ops Analyst    | Moderate cases, triage spikes  | `direct`         | Limited to analysts on-call, audited via AuditService. |
| Trust Data Scientist | Model evaluation, A/B analysis | `hashed`         | May join with model outputs; no raw identifiers.       |
| Leadership / Legal   | Weekly/Monthly summaries       | `aggregate`      | Receives redacted exports or memo-ready charts.        |

## Data Sources

1. `AnalyticsUserSnapshot`
   - Window-aligned captures produced by `AnalyticsIngestionService.snapshotUsers`.
   - Contains hashed contact points, trust scores, verification flag, orientation metadata, and JSON preferences.
2. `AnalyticsTrustSignalFact`
   - Ingested from `RiskSignal` rows; includes severity, channel, score, user tiers.
3. `AnalyticsModerationFact`
   - Mirrors moderation events with severity, message, and tier tagging.
4. `AuditExportRequest` / `AuditPurgeRequest`
   - Supports compliance exports for dashboard slices that need offline review.

## Dashboard Modules

1. **Trust Health Overview**
   - KPIs: snapshot count, verified rate, average trust score, orientation distribution.
   - Filters: orientation, time range, PII tier (affects row-level availability).
2. **Trust Signals Heatmap**
   - Severity/channel breakdown (bar charts) + day-level trend with timezone offsets.
   - Drill-down: link to Trust service (`/trust/signals/user/:id`) when tier ≥ `direct`.
3. **Moderation Pipeline**
   - Severity mix, backlog trend, escalation ratio.
   - Hooks into Moderation service automation metrics (future Phase 4.2).
4. **Privacy & Compliance Widget**
   - Upcoming export/purge requests, outstanding retention actions, hashed user counts affected.

## API Surface

`GET /analytics/dashboard`

- Validated by `AnalyticsDashboardQueryDto`.
- Query params: `startDate`, `endDate`, optional `maxPiiTier`, `orientation`, `timezoneOffsetMinutes`.
- Response: `AnalyticsDashboardResponse` (trustHealth, trustSignals, moderation blocks) documented in `docs/identity_service.md`.
- Authorization: gate via future `AnalyticsAccessGuard` (TODO) that maps persona → tier.

## Reporting Surfaces

| Surface         | Format                         | Frequency | Notes                                                              |
| --------------- | ------------------------------ | --------- | ------------------------------------------------------------------ |
| Ops Console     | React/Next.js module (Phase 5) | Real-time | Consumes `GET /analytics/dashboard`.                               |
| Weekly Brief    | PDF/Notion export              | Weekly    | Generated via script calling API with `maxPiiTier=aggregate`.      |
| Compliance Pack | CSV export in S3               | On-demand | Triggered when legal requests hashed signals for specific windows. |

## Privacy Controls

- **Tier Enforcement**: `AnalyticsDashboardService` restricts records to tiers ≤ `maxPiiTier`.
- **Orientation Filter**: Optional filter reduces scope when analysts focus on specific pools; aggregated numbers only when tier < `direct`.
- **Timezone Buckets**: Offsets applied in-memory, preventing client-side tz manipulation.
- **Audit Hooks**: API access logs must include actor + tier; TODO add middleware to push to `AuditService`.
- **Export Sanitization**: For `aggregate` tier exports, omit `hashedUserId`, include percentages only.

## Next Steps

1. Implement `AnalyticsAccessGuard` + role-based tier mapping (config-driven) before exposing endpoint publicly.
2. Build dashboard UI in Trust console (Phase 5) using the API contract.
3. Automate weekly aggregate memo by calling API with `maxPiiTier=aggregate` and storing rendered artifacts in the audit export bucket.
4. Extend tests to cover guard + export sanitization once access control lands.
