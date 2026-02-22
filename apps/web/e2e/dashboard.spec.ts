import { test, expect } from '@playwright/test';

// This test assumes the dev server is running on localhost:3000 or 3001.
// If your dev server uses a different port, set PLAYWRIGHT_BASE_URL accordingly.

test.describe('Dashboard smoke', () => {
  test('loads dashboard and shows main regions', async ({ page }) => {
    const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
    await page.goto(`${base}/dashboard`);
    await expect(page.locator('nav[aria-label="Sections"]')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('section[aria-label="Summary statistics"]')).toBeVisible();
    await expect(page.getByRole('region', { name: /Profile summary|Profile/i })).toBeVisible();
  });
});
