const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));

  try {
    await page.goto('http://localhost:4000/onboarding', { waitUntil: 'networkidle' });
    // wait for email input
    const email = await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await email.click();
    await page.keyboard.type('a');
    await page.waitForTimeout(200);
    await page.keyboard.type('b');
    await page.waitForTimeout(200);
    // read value
    const val = await page.evaluate(() => document.querySelector('input[type="email"]').value);
    console.log('EMAIL VALUE AFTER TYPING:', val);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await browser.close();
  }
})();
