Deployment commands

Prerequisites:

- `VERCEL_TOKEN` environment variable set (personal token) for legacy Vercel deploys
- `vercel` CLI installed and logged in optionally

Frontend (web):

```bash
# from repo root
npm run deploy:web
```

This uses the `.vercel` project configuration inside `apps/web`.

Enable Upstash Redis for snapshot caching
- Required env vars (production): `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Purpose: provides a durable, globally-available cache for `TrustCenter` snapshots so the dashboard can serve a stale snapshot when the identity API is intermittently unavailable.
- How to set (examples):
  - Netlify: add the two env vars under Site settings → Build & deploy → Environment.
  - Vercel: add the two env vars under Project Settings → Environment Variables.

Notes:

- API routes and server components proxy to `https://api-amoravibe.vercel.app` by default. Override via `TRUST_API_PROXY_TARGET` (server-only) or `NEXT_PUBLIC_TRUST_API_URL` (client/server) if you need a different upstream (e.g., staging).

Backend (identity):

```bash
npm run deploy:identity
```

Deploy both:

```bash
npm run deploy:web
```

Notes:

- Each `--cwd` invocation uses the local `.vercel` project config inside that directory when present.
- If you prefer explicit project ids, you can add `--project <projectId>` to the commands.
- Use `--confirm` to skip interactive prompts in CI.
