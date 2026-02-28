import { test, expect } from '@playwright/test';

// Basic admin dashboard UI test
// Assumes admin is already authenticated or public for test

test('Admin Dashboard: should render all main widgets', async ({ page }) => {
  // Ensure admin session exists for this test
  await page.context().addCookies([
    { name: 'lovedate_session', value: JSON.stringify({ userId: 'admin@amoravibe.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 45_000 });

  // Wait for admin page shell to render, then allow extra time for client widgets to hydrate
  await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible({ timeout: 30_000 });

  const widgetHeadings = [
    /platform metrics/i,
    /user management/i,
    /activity log/i,
    /trust\/verification override/i,
    /system health/i,
  ];

  for (const heading of widgetHeadings) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 30_000 });
  }
});

test('Admin Dashboard: trust override widget allows marking a user verified', async ({ page }) => {
  await page.context().addCookies([
    { name: 'lovedate_session', value: JSON.stringify({ userId: 'admin@amoravibe.com' }), domain: 'localhost', path: '/' },
  ]);

  await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await expect(page.getByRole('heading', { name: /trust\/verification override/i })).toBeVisible({ timeout: 30_000 });

  const overrideInput = page.getByPlaceholder('User ID');
  await overrideInput.fill('local-guest');
  await page.getByRole('button', { name: /mark verified/i }).click();
  await expect(page.getByText(/User .*local-guest.* marked as verified/i)).toBeVisible({ timeout: 30_000 });
});
