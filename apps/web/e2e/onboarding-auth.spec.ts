import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4000';

test('onboarding signup -> complete profile -> redirect to dashboard, then sign out and sign back in', async ({ page }) => {
  const email = `tester+bot+${Date.now()}@example.com`;
  const password = 'TestPass123!';

  // Start at onboarding (signup)
  await page.goto(`${BASE}/onboarding`);
  await expect(page).toHaveURL(/onboarding/);

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  // Click signup and wait for the signup API response (longer timeout for dev server)
  await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/auth/signup') && r.status() >= 200 && r.status() < 400, { timeout: 30000 }).catch(() => {}),
    page.click('text=Sign Up & Continue'),
  ]);

  // Wait for profile step (Full Name input) — extended timeout
  await page.waitForSelector('input[placeholder="Full Name"]', { timeout: 30000 });
  await page.fill('input[placeholder="Full Name"]', 'Tester Bot');
  await page.fill('input[placeholder="Age"]', '30');
  await page.fill('input[placeholder="Location"]', 'Test City');
  await page.fill('input[placeholder="Job Title"]', 'Engineer');
  await page.fill('textarea[placeholder="About Me"]', 'Automated test user');
  await page.fill('input[placeholder="Interests (comma separated)"]', 'music,reading');

  await Promise.all([
    page.waitForURL(/dashboard/, { timeout: 30000 }),
    page.click('text=Finish & Go to Dashboard')
  ]);

  // We're on dashboard now
  await expect(page).toHaveURL(/dashboard/);

  // Navigate to signout endpoint (server provides sign out route)
  await page.goto(`${BASE}/api/auth/signout`);

  // Now navigate to sign-in page and sign in
  await page.goto(`${BASE}/auth/signin`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await Promise.all([
    page.waitForURL(/dashboard/, { timeout: 30000 }),
    page.click('text=Sign In')
  ]);

  await expect(page).toHaveURL(/dashboard/);
});
