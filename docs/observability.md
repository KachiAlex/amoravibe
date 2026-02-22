# Observability & Monitoring (recommended)

This document describes the minimal steps to enable error telemetry and a synthetic health check for the dashboard/trust-snapshot flow.

## What we added (quick)
- Sentry integration (server-side) — `apps/web` now contains `src/lib/observability.ts` which will forward exceptions to Sentry when `SENTRY_DSN` is set.
- Instrumentation points added to the trust snapshot path:
  - snapshot fetch attempts (breadcrumbs)
  - retry/final-failure errors (Sentry events)
  - Upstash read/write failures are recorded as breadcrumbs/messages
- GitHub Action synthetic check (`.github/workflows/synthetic-dashboard-check.yml`) that runs every 5 minutes and pings a configurable URL.

## Required secrets / env vars
- `SENTRY_DSN` — set this in your hosting / environment to enable Sentry reporting for server-side errors.
- `SENTRY_AUTH_TOKEN` — required when running the release upload script or creating alerts via API.
- `SYNTHETIC_DASHBOARD_URL` (GitHub repo secret) — URL the synthetic check should ping (e.g. `https://your-app.example.com/dashboard`).
- (Optional) `SENTRY_TRACES_SAMPLE_RATE` — sampling rate for performance traces (default 0).
- **Datadog metrics** (optional):
  - `DATADOG_STATSD_HOST` / `DATADOG_STATSD_PORT` — address of the DogStatsD agent.
  - `DATADOG_TAGS` — comma-separated global tags to attach to every metric.



## Recommended alerting rules
- **Snapshot errors** – trigger when the rate of `trust.snapshot.fetch_failed_attempt` messages
  or captured exceptions tagged `trust.snapshot` exceeds a threshold (e.g. >5 occurrences
  within 5 minutes).
  ```json
  {
    "project": "web",
    "name": "Trust snapshot failures",
    "conditions": [
      {"id": "sentry.rules.conditions.EventFrequencyCondition",
       "setting": {"event": "trust.snapshot.fetch_failed_attempt",
                    "comparison": ">" ,"value": "5", "interval": "5m"}}
    ],
    "actions": [
      {"id": "sentry.rules.actions.NotifyEmailAction",
       "settings": {"email": "oncall@yourcompany.com"}}
    ]
  }
  ```
- **Cache problems** – monitor for `trust-cache.upstash.read_failed` or
  `trust-cache.upstash.write_failed` messages. Use a similar frequency rule and
  consider escalating to Slack or PagerDuty when >10 events in 10 minutes.
- **Synthetic check failure** – wire the GitHub Action failure to your alerting
  system (e.g. Slack webhook or Sentry via the generic `Webhook` action).

## Metric names
Datadog metrics are emitted when the DogStatsD host is configured. Key names:

- `trust.cache.hit` / `trust.cache.miss`
- `trust.cache.upstash.read` / `trust.cache.upstash.write`
- `trust.snapshot.fetch_attempt` (count of network calls)
- `trust.snapshot.fetch_failed_attempt` (measured per attempt)
- `trust.snapshot.fetch_retries` (number of retries per load)
- `trust.snapshot.fetch_final_failure` (load completely failed)
- `trust.snapshot.load_from_cache` / `trust.snapshot.cache_miss`
- `trust.snapshot.cache_error`

These can be used to create Datadog dashboards or alert rules.

### Sentry dashboard example
Create a dashboard with the following widgets:
1. **Error count** graph filtered by `error.message:trust.snapshot`.
2. **Breadcrumb timeline** showing `trust.snapshot.fetchTrustSnapshot attempt`.
3. **Custom metric** for cache read/write failures (`trust-cache.upstash.*`).

Each widget helps operators quickly assess the health of the snapshot pipeline.

>You can create alert rules via the Sentry UI or using the [Sentry API](https://docs.sentry.io/api/projects/alerts/).

## Runbook (brief)
1. Check Sentry for recent `trust.snapshot` errors and breadcrumbs (see attempt counts).
2. Confirm `/api/check-env` shows expected cache/upstream config.
3. Use synthetic check logs (GitHub Actions) to see recent failures.
4. If upstream identity is down, fallback snapshot is used — verify E2E/seed flags if in CI.

## How to enable now
1. Add `SENTRY_DSN` to the hosting environment (Netlify/Vercel/Firebase) for `apps/web`.
2. Add `SYNTHETIC_DASHBOARD_URL` to GitHub repository secrets (used by the scheduled workflow).
3. Optionally configure alerting in Sentry or Datadog for `trust.snapshot.*` errors.
### Uploading source maps & releases
Run from the **repo root** so the helper script path resolves correctly. The npm script lives in `apps/web` but uses `npx` so you can also run that handy command anywhere under the monorepo.

```bash
# from root (preferred)
node scripts/upload-sourcemaps.js
# or equivalently from the web package:
(cd apps/web && npm run sentry:release)
```

Ensure `SENTRY_AUTH_TOKEN` is set in your environment when invoking these commands; it is not required for normal runtime.
---

If you want, I can:
- add Datadog metrics export and example alert rules,
- wire Sentry releases + source maps (build-time), or
- create a dashboard for snapshot/cache health metrics.

Tell me which of the above you'd like next. ✨