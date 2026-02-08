import { test, expect } from '@playwright/test';

test.describe('Onboarding -> Dashboard smoke', () => {
  test('redirects to dashboard', async ({ page }) => {
    // Start at onboarding and confirm it navigates to /dashboard
    await page.goto('http://localhost:3000/onboarding');
    // If onboarding auto-redirects, we should arrive at /dashboard
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/dashboard');
    // Basic sanity check: page contains Dashboard heading
    await expect(page.locator('h1, h2, h3').first()).toHaveText(/dashboard/i);
  });
});
