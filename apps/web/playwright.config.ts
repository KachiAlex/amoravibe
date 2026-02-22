import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  // Optionally start the built Next.js server automatically for CI / local runs.
  // If `PLAYWRIGHT_START_SERVER=0` is set, Playwright will not start a server and
  // tests can point at an already running dev server via `PLAYWRIGHT_BASE_URL`.
  webServer: process.env.PLAYWRIGHT_START_SERVER === '0' ? undefined : {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    // Inject E2E-only env so the app serves seeded trust snapshots during Playwright runs.
    env: {
      NEXT_PUBLIC_USE_SEED_SNAPSHOT: '1',
    },
  },
});
