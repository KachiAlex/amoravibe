const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3002';
  const out = 'apps/web/playwright-screenshots/dashboard-loggedin.png';

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
  const page = await context.newPage();

  try {
    // Navigate to root to establish same-origin context
    await page.goto(base, { waitUntil: 'networkidle' });

    // Call dev endpoint to set session cookie (must be enabled in dev)
    await page.evaluate(async (base) => {
      try {
        await fetch(base + '/api/dev/set-admin-session', { method: 'POST', credentials: 'include' });
      } catch (e) {
        // ignore
      }
    }, base);

    // Navigate to dashboard (logged-in)
    await page.goto(base + '/dashboard?section=home#top', { waitUntil: 'networkidle' });

    // Wait a moment for any client rendering
    await page.waitForTimeout(500);

    await page.screenshot({ path: out, fullPage: true });
    console.log('Saved screenshot to', out);
  } catch (err) {
    console.error(err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
