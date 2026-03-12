#!/usr/bin/env node
/**
 * Lightweight performance audit script for mobile responsiveness
 * Captures LCP, FID, CLS, and device emulation metrics
 */

const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const AUDIT_URL = process.env.AUDIT_URL || 'http://localhost:4000';
const OUT_DIR = path.join(__dirname, '..', 'test-results', 'performance');

async function auditPage(url, deviceName) {
  try {
    const browser = await chromium.launch();
    const device = devices[deviceName];
    const context = await browser.newContext({
      ...device,
      recordVideo: { dir: OUT_DIR },
    });
    const page = await context.newPage();
    
    // Inject performance observer
    await page.addInitScript(() => {
      window.perfMetrics = {
        lcp: 0,
        fcp: 0,
        cls: 0,
        dcl: 0,
        start: performance.now(),
      };
      
      // Collect LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.perfMetrics.lcp = entries[entries.length - 1].renderTime || entries[entries.length - 1].loadTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Collect CLS
      let cls = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) cls += entry.value;
        }
        window.perfMetrics.cls = cls;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
      // FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.perfMetrics.fcp = entries[0].startTime;
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      
      // DCL
      document.addEventListener('DOMContentLoaded', () => {
        window.perfMetrics.dcl = performance.now() - window.perfMetrics.start;
      });
    });
    
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    
    // Get metrics
    const metrics = await page.evaluate(() => window.perfMetrics);
    const size = await page.evaluate(() => ({
      dom: document.documentElement.children.length,
      jsHeap: performance.memory?.jsHeapUsedSize || 0,
    }));
    
    const report = {
      device: deviceName,
      url,
      timestamp: new Date().toISOString(),
      metrics: { ...metrics, loadTime },
      size,
    };
    
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const fileName = `${deviceName.replace(/\W+/g, '-')}-${Date.now()}.json`;
    fs.writeFileSync(path.join(OUT_DIR, fileName), JSON.stringify(report, null, 2));
    
    console.log(`✓ Audited ${url} on ${deviceName}:`, {
      LCP: `${report.metrics.lcp.toFixed(0)}ms`,
      FCP: `${report.metrics.fcp.toFixed(0)}ms`,
      CLS: report.metrics.cls.toFixed(3),
      DCL: `${report.metrics.dcl.toFixed(0)}ms`,
      Load: `${loadTime}ms`,
    });
    
    await browser.close();
  } catch (err) {
    console.error(`✗ Audit failed for ${deviceName}:`, err.message);
  }
}

(async () => {
  console.log('Starting mobile performance audit...\n');
  const devices = ['iPhone 13', 'Pixel 5', 'iPad (gen 7)'];
  const urls = [AUDIT_URL, `${AUDIT_URL}/dashboard`, `${AUDIT_URL}/onboarding`];
  
  for (const url of urls) {
    console.log(`\nAuditing: ${url}`);
    for (const device of devices) {
      await auditPage(url, device);
    }
  }
  
  console.log(`\n✓ Audit complete. Results saved to ${OUT_DIR}`);
  process.exit(0);
})().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
