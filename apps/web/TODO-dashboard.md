# Dashboard Optimization TODOs

## Data loading & caching
- [ ] Move `StatsCards` to rely on server-delivered stats (props) and only hit `/api/stats` when the user manually refreshes.
- [ ] Pass server-fetched matches/messages into `MatchesGrid` and other widgets so initial render has everything without client waterfalls.
- [ ] Add a short-lived per-user cache for `getDashboardData` to de-duplicate expensive lookups.
- [ ] Consolidate stats/matches/messages fetches behind a single dashboard aggregation API or server action to reduce round-trips.

## Client performance & UX polish
- [ ] Throttle/guard the stat animation effect so it only runs when values actually change, reducing unnecessary `requestAnimationFrame` work.
- [ ] Port modal/snackbar overlays in `MatchesGrid` to portals and memoized list rows to avoid whole-grid rerenders.
- [ ] Replace `any` usage in dashboard components with `Match`/`Message` types and prepare server-side filtering + pagination.
- [ ] Lazy-load heavy tab panels only after activation and block their internal fetches until then.
- [ ] Instrument search, like/pass, refresh, and other key flows with tracing/telemetry for future perf analysis.

## Feature completeness & resilience
- [ ] Wire header search, notifications badge, and theme toggle into real backend data with persisted preferences.
- [ ] Add toasts + retry states for like/pass actions so failures aren’t silent.
- [ ] Surface real muted/archived counts in the messages widget and ensure filters deep-link correctly.
- [ ] Keep discover/engagement data (filters, perks, resources, shortcuts) dynamic—no more static fallbacks.

## Backend/service follow-ups
- [ ] Build or expose a dashboard aggregation endpoint (or server action) that hydrates stats/matches/messages in one go.
- [ ] Ensure engagement APIs always return auxiliary metadata and are resilient to upstream hiccups (timeouts, partial data).

## Admin dashboard optimization
- [ ] Streamline `<AdminDashboardPage>` so the server component gathers trust snapshot + stats before render, eliminating client waterfalls.
- [ ] Wrap `AdminWidgetsClient` sections with `React.Suspense` + skeletons and lazy-load heavy charts only after intersection reveal.
- [ ] Consolidate trust API calls into a single helper that reuses auth tokens and retries with jitter for better resilience.
- [ ] Add SWR polling (5–10s) for AdminMetrics/UserTable so the page reflects live data without manual refreshes.
- [ ] Instrument admin actions (overrides, bans, snapshots) using `hot-shots` so we can observe latency + failures.
