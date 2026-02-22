import { test, expect } from '@playwright/test';

// Basic admin dashboard UI test
// Assumes admin is already authenticated or public for test

test('Admin Dashboard: should render all main widgets', async ({ page }) => {
  // Ensure admin session exists for this test
  await page.context().addCookies([
    { name: 'lovedate_session', value: JSON.stringify({ userId: 'admin@amoravibe.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/admin', { waitUntil: 'networkidle', timeout: 30_000 });

  // Wait for admin page shell to render, then allow extra time for client widgets to hydrate
  await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible({ timeout: 15_000 });

  // Check for main widgets by heading or label (allow longer time for dynamic widgets)
  await expect(page.getByRole('heading', { name: /metrics/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /user management|users/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /activity log/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /trust override/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /system health/i })).toBeVisible({ timeout: 15_000 });
});
