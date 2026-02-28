# Admin Playwright Workflow

This doc captures the reliable way to run the admin dashboard specs without relying on Playwright to boot the Next.js server.

## 1. Build once

```bash
cd apps/web
npm run build
```

## 2. Start the production server manually

```bash
cd apps/web
npm run start:playwright
```

- Serves the app on http://localhost:4000 using the already-built artifacts.
- Leave this running in its own terminal.

## 3. Run the admin specs against the running server

```bash
cd apps/web
npm run test:admin-playwright
```

This script sets `PLAYWRIGHT_START_SERVER=0` and points the tests at `http://localhost:4000`, so they don’t wait for Playwright’s `webServer` boot.

## 4. (Optional) Reset admin mock data before UI actions

If you need deterministic users (e.g., when re‑introducing verify/ban flows), reset the mock store:

```bash
curl -X POST http://localhost:4000/api/e2e/admin-users/reset \
  -H "Content-Type: application/json" \
  -d '{
        "bob@example.com": { "isVerified": false, "banned": false },
        "local-guest": { "isVerified": false, "banned": false }
      }'
```

This hits `apps/web/src/app/api/e2e/admin-users/reset/route.ts`, which hydrates the seed users from `admin-users.ts`.

## 5. Future richer flows

Once the server start is stable, we can layer back:

- User table interactions (search/view/verify/ban) using the reset API before each spec.
- API-level assertions (check `/api/trust/admin/users/:id`) instead of brittle DOM polling.

But the smoke specs above should now pass consistently.
