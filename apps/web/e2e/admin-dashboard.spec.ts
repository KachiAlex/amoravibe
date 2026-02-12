import { test, expect } from '@playwright/test';

// Basic admin dashboard UI test
// Assumes admin is already authenticated or public for test

test('Admin Dashboard: should render all main widgets', async ({ page }) => {
  await page.goto('/admin');

  // Check for main widgets by heading or label
  await expect(page.getByRole('heading', { name: /metrics/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /user management|users/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /activity log/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /trust override/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /system health/i })).toBeVisible();
});
