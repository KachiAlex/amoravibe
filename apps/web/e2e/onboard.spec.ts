import { test, expect } from '@playwright/test';

test('onboarding creates account and navigates to dashboard', async ({ page }) => {
  const unique = Date.now();
  const email = `e2e+${unique}@local.test`;
  const password = 'Password123!';

  await page.goto('http://localhost:4000/onboarding');

  // Capture page console and auth/profile network calls
  page.on('console', (msg) => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.error('PAGE ERROR:', err));

  // Capture auth/profile network calls
  const calls: any[] = [];
  page.on('response', async (res) => {
    try {
      const url = res.url();
      if (url.includes('/api/auth') || url.includes('/api/profile')) {
        let body = '';
        try { body = await res.text(); } catch (e) { body = '<unavailable>'; }
        calls.push({ url, status: res.status(), body });
        console.log('NET:', url, res.status());
      }
    } catch (err) {
      console.warn('response handler error', err);
    }
  });

  // Fill signup
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('text=Sign Up & Continue');

  // Wait for signup network call to complete
  await page.waitForResponse((r) => r.url().includes('/api/auth/signup'), { timeout: 10000 });
  // wait for session fetch after signin
  const sessionResp = await page.waitForResponse((r) => r.url().includes('/api/auth/session'), { timeout: 5000 }).catch(() => null);
  if (sessionResp) {
    console.log('SESSION status', sessionResp.status());
    try {
      console.log('SESSION body', await sessionResp.text());
    } catch (sessionErr) {
      console.warn('SESSION body read failed', sessionErr);
    }
  } else {
    console.log('No session response observed');
  }

  // Wait for profile step (step 2 form)
  await page.waitForSelector('text=Complete Your Profile', { timeout: 10000 });

  // Fill profile
  await page.fill('input[placeholder="Full Name"]', 'E2E Test');
  await page.fill('input[placeholder="Age"]', '30');
  await page.fill('input[placeholder="Location"]', 'Test City');
  await page.fill('input[placeholder="Job Title"]', 'QA');
  await page.fill('input[placeholder="Interests (comma separated)"]', 'testing,playwright');

  // Submit profile
  await page.click('text=Finish & Go to Dashboard');

  // Wait for profile PATCH to complete and log calls
  await page.waitForResponse((r) => r.url().includes('/api/profile') && (r.status() < 500), { timeout: 10000 });
  console.log('Captured network calls:', calls.map(c=>({ url: c.url, status: c.status })));

  // Expect navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  expect(page.url()).toContain('/dashboard');
});
