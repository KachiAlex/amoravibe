import { test, expect } from '@playwright/test';

// This test simulates a full onboarding flow and checks dashboard redirect

test('Onboarding flow redirects to dashboard', async ({ page }) => {
  // Go to onboarding page
  await page.goto('/onboarding');

  // Fill out onboarding form (replace selectors with real ones)
  await page.fill('input[name="displayName"]', 'TestUser');
  await page.fill('input[name="email"]', `ci+onboard${Date.now()}@amoravibe.test`);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="dateOfBirth"]', '1990-01-01');
  await page.selectOption('select[name="gender"]', 'man');
  await page.selectOption('select[name="orientation"]', 'heterosexual');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard\?userId=.*/);

  // Check dashboard loaded
  await expect(page).toHaveURL(/\/dashboard\?userId=.*/);
  await expect(page.locator('h1')).toContainText(['dashboard', 'Dashboard', 'Trust dashboard']);
});
