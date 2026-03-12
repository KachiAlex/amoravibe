const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const OUT_DIR = path.join(__dirname, '..', 'test-results', 'mobile-screenshots');
const URLS = ['http://localhost:5001/', 'http://localhost:5001/dashboard', 'http://localhost:5001/onboarding'];
const DEVICE_KEYS = ['iPhone 13', 'Pixel 5', 'iPad (gen 7)'];

(async () => {
  try {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const browser = await chromium.launch();
    for (const key of DEVICE_KEYS) {
      const device = devices[key];
      const dir = path.join(OUT_DIR, key.replace(/\W+/g, '-'));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const context = await browser.newContext({ ...device });
      const page = await context.newPage();
      console.log(`Capturing screenshots for device: ${key}`);
      for (const url of URLS) {
        const safeName = url.replace('http://localhost:4000', '').replace(/[^a-z0-9]/gi, '_') || 'root';
        const dest = path.join(dir, safeName + '.png');
        try {
          const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
          if (!resp || !resp.ok()) console.warn(`Warning: ${url} returned ${resp && resp.status()}`);
          await page.waitForTimeout(1000); // extra time for styles
          await page.screenshot({ path: dest, fullPage: true });
          console.log(`Saved ${dest}`);
        } catch (err) {
          console.error(`Failed to capture ${url} on ${key}:`, err.message);
        }
      }
      await context.close();
    }
    await browser.close();
    console.log('Mobile audit complete. Screenshots saved to', OUT_DIR);
    process.exit(0);
  } catch (err) {
    console.error('Mobile audit failed:', err);
    process.exit(1);
  }
})();
