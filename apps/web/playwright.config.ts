import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4000',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  // Optionally start the built Next.js server automatically for CI / local runs.
  // If `PLAYWRIGHT_START_SERVER=0` is set, Playwright will not start a server and
  // tests can point at an already running dev server via `PLAYWRIGHT_BASE_URL`.
  webServer: process.env.PLAYWRIGHT_START_SERVER === '0' ? undefined : {
    command: 'npm run start',
    port: 4000,
    reuseExistingServer: !process.env.CI,
    // Inject E2E-only env so the app serves seeded trust snapshots during Playwright runs.
    env: {
      NEXT_PUBLIC_USE_SEED_SNAPSHOT: '1',
    },
  },
});
