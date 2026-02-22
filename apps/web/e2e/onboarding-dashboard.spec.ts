import { test, expect } from '@playwright/test';

// This test simulates a full onboarding flow and checks dashboard redirect

test('Onboarding flow redirects to dashboard', async ({ page }) => {
  // Go to onboarding page and wait for the form to render
  await page.goto('/onboarding');
  await page.waitForSelector('input[name="displayName"]', { timeout: 10_000 });

  // Fill out onboarding form (selectors match the app's OnboardingModal)
  await page.fill('input[name="displayName"]', 'TestUser');
  const testEmail = `ci+onboard${Date.now()}@amoravibe.test`;
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="dateOfBirth"]', '1990-01-01');
  await page.selectOption('select[name="gender"]', 'man');
  await page.selectOption('select[name="orientation"]', 'heterosexual');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard and assert UI is present
  await page.waitForURL(/\/dashboard\?userId=.*/, { timeout: 15_000 });
  await expect(page).toHaveURL(/\/dashboard\?userId=.*/);
  await expect(page.locator('h1')).toContainText(/dashboard/i);
  // Ensure the seeded profile is visible in the header or trust summary
  await expect(page.locator('text=Trust Center')).toBeVisible();
});
