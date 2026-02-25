const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:4000/onboarding', { waitUntil: 'networkidle' });
    // Fill signup form
    await page.fill('input[type="email"]', 'testuser+' + Date.now() + '@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    // Wait for either profile step or error
    try {
      await page.waitForSelector('text=Complete Your Profile', { timeout: 5000 });
    } catch (e) {
      const content = await page.content();
      console.log('PAGE CONTENT AFTER SIGNUP:', content);
      throw e;
    }
    // Fill minimal profile
    await page.fill('input[placeholder="Full Name"]', 'Test User');
    await page.fill('input[placeholder="Age"]', '30');
    await page.fill('input[placeholder="Location"]', 'Test City');
    await page.click('button[type="submit"]');
    // Wait for dashboard redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    const url = page.url();
    if (!url.includes('/dashboard')) throw new Error('Did not reach dashboard');
    console.log('SUCCESS: Signed up and reached dashboard:', url);
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('FAIL:', err);
    await browser.close();
    process.exit(1);
  }
})();
