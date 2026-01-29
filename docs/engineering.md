# Engineering Guide

## Monorepo Workflow

- **Package Manager**: pnpm 9+. Always run `pnpm install` at repo root to ensure the workspace lockfile stays consistent.
- **Task Runner**: TurboRepo powers caching + parallelization. Common commands:
  - `pnpm dev --filter services/identity` — run a specific app/service.
  - `pnpm test --filter ./packages/*` — targeted package tests.
  - `pnpm lint` — invokes ESLint across workspaces via Turbo pipeline.
- **Scripts** live in each package`s `package.json`; prefer `pnpm <script> --filter <target>` to avoid running unnecessary workspaces.

## Branching & Commits

- Follow Conventional Commits (`feat:`, `fix:`, `docs:`…).
- Husky runs Prettier + lint-staged before commits. Use `pnpm format` to auto-fix.

## Development Flow

1. `pnpm install`
2. `pnpm lint && pnpm test` (or scoped variants) before PRs.
3. For frontend work, run `pnpm dev --filter services/identity` and visit the site via NestJS proxy.
4. For docs, run `npx prettier --write "docs/**/*.md"` to satisfy hooks.

### Local Trust API configuration

- Keep `apps/web/.env.local` minimal. Let `NEXT_PUBLIC_TRUST_API_URL` default (empty) so the browser calls the internal `/api/trust` proxy.
- Set `TRUST_API_PROXY_TARGET=http://localhost:3001` (or your identity-service port) so the proxy forwards to the Nest backend.
- Provide `TRUST_API_KEY` only if the identity service enforces the `x-api-key` header. Use the same value in both the frontend `.env.local` and the backend environment.
- Start the backend with `pnpm dev --filter services/identity` (or `npm run dev` in `services/identity`). Prisma artifacts must exist (`npx prisma generate`) before booting.
- Once the backend is running, the onboarding modal’s `POST /onboarding` will create the user, the `/api/session` route will set the `lovedate_session` cookie, and the UI will redirect to `/dashboard`.

## Turbo Tips

- Use `pnpm turbo run build --filter=services/identity...` to build service + deps.
- Remote caching can be enabled by setting `TURBO_TOKEN` once we provision it in CI.
