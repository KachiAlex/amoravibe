# Admin Dashboard Rebuild TODO

## Foundation
- [ ] Define admin role contract in Prisma schema (ensure `role` enum covers `admin`).
- [ ] Add `/admin` route guard in middleware (auth + role check).
- [ ] Scaffold `/app/admin/layout.tsx` with sidebar + top nav shell.
- [ ] Implement `/app/admin/page.tsx` overview page (SSR) that fetches metrics via server action.

## API Layer
- [ ] Create `/app/api/admin/metrics/route.ts` for overview cards.
- [ ] Create `/app/api/admin/users/route.ts` with pagination + filtering.
- [ ] Add `/app/api/admin/actions/route.ts` to list audit events.
- [ ] Secure admin APIs with token + role validation helper.

## UI Sections
- [ ] Overview cards: total users, active users (24h), new signups, flagged accounts.
- [ ] Trend charts (signups vs matches, rolling 7-day active users).
- [ ] User management table: search, filters (role/status), actions (ban/unban, force verify).
- [ ] Reports queue: list trust & safety flags with resolution workflow.
- [ ] System health widget: DB latency, queue depth, last outage.

## Observability & Security
- [ ] Add `AdminAction` Prisma model + logging helper.
- [ ] Rate-limit admin APIs & enforce audit headers.
- [ ] Add Playwright smoke test: admin login + navigate between tabs.
- [ ] Add alerting hook (email/slack) for critical admin actions.

## Stretch
- [ ] Integrate Trust Center overrides.
- [ ] Real-time notifications via WebSockets for new reports.
- [ ] Export CSV for user listings.
