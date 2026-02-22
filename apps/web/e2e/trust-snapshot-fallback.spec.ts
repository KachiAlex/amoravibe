import { test, expect } from '@playwright/test';

// When the upstream trust API fails, the dashboard should render a limited view
// (stale-while-revalidate / cached fallback) rather than an error page.

test('Dashboard shows limited fallback when trust API is unavailable', async ({ page }) => {
  // Ensure a session cookie exists so the dashboard tries to load a snapshot for this user.
  await page.context().addCookies([
    { name: 'lovedate_session', value: JSON.stringify({ userId: 'user_2' }), domain: 'localhost', path: '/' },
  ]);

  // Intercept the trust API call and simulate an upstream failure.
  await page.route('**/api/trust/center/*', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Service unavailable' }) })
  );

  await page.goto('/dashboard');

  // The page should still render and show the fallback notice we added.
  await expect(page.locator('text=Identity snapshot not available yet')).toBeVisible({ timeout: 5000 });

  // Basic smoke check that other dashboard UI pieces are present.
  await expect(page.locator('text=Welcome back')).toBeVisible();
});