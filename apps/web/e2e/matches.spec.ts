import { test, expect } from '@playwright/test';

test.describe('Matches page', () => {
  test('request intro button toggles to liked', async ({ page }) => {
    // Assumes local dev server running at http://localhost:3000
    await page.goto('http://localhost:4000/matches');

    // Wait for matches list to load
    const requestBtn = page.locator('button:has-text("Request intro")').first();
    await expect(requestBtn).toBeVisible({ timeout: 10_000 });

    // Click the button and expect the UI to update to "Liked" (optimistic)
    await requestBtn.click();

    const liked = page.locator('text=Liked').first();
    await expect(liked).toBeVisible({ timeout: 5000 });
  });
});
