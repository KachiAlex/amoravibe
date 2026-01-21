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

## Turbo Tips

- Use `pnpm turbo run build --filter=services/identity...` to build service + deps.
- Remote caching can be enabled by setting `TURBO_TOKEN` once we provision it in CI.
