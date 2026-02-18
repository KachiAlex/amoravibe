# Lovedate Monorepo

Authenticity-first dating platform focused on strict gender/orientation verification and LGBTQ inclusion.

## Getting Started

1. **Install prerequisites**
   - Node.js >= 20.10
   - pnpm 8 (`corepack enable` recommended)

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Enable Husky hooks** (runs automatically after install, but can be re-run)

   ```bash
   pnpm prepare
   ```

4. **Run workspace tasks**
   ```bash
   pnpm dev      # Start all dev targets via Turbo
   pnpm build    # Build all packages/apps
   pnpm lint     # Lint via Turbo pipeline
   pnpm test     # Execute tests
   pnpm format   # Apply Prettier formatting
   ```

## Repo Layout

```
apps/       # Frontend clients (web, mobile shells)
services/   # Backend services (identity, profile, matching, trust, etc.)
packages/   # Shared libraries (design system, schemas, tooling)
docs/       # Product & architecture documentation
```

## Next Steps

- Fill in service/app scaffolds under their respective folders.
- Extend ESLint configs per runtime (web/node).
- Wire CI/CD and IaC stacks per Phase 1 plan in `docs/todo.md`.
