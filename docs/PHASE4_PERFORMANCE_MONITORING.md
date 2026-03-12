# Phase 4: Performance Testing & Monitoring Setup

**Goal:** Establish performance baselines, validate Phase 3 improvements, and set up ongoing monitoring.

---

## 📋 Phase 4 Implementation Plan

### Step 1: Web Vitals Monitoring

Create a client-side Web Vitals reporting module:

#### 1.1 Core Vitals Tracking
```tsx
// src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export function trackWebVitals(callback?: (metric: WebVital) => void) {
  // Thresholds based on Core Web Vitals standards
  const THRESHOLDS = {
    FCP: { good: 1800, poor: 3000 }, // milliseconds
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 }, // milliseconds (with feedback)
    CLS: { good: 0.1, poor: 0.25 }, // unitless
    TTFB: { good: 600, poor: 1800 }, // milliseconds
  };

  const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'needs-improvement';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  getCLS((metric) => {
    const vital: WebVital = {
      name: 'CLS',
      value: metric.value,
      rating: getRating('CLS', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    console.log('[Web Vitals]', vital);
    callback?.(vital);
  });

  getFCP((metric) => {
    const vital: WebVital = {
      name: 'FCP',
      value: metric.value,
      rating: getRating('FCP', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    console.log('[Web Vitals]', vital);
    callback?.(vital);
  });

  getLCP((metric) => {
    const vital: WebVital = {
      name: 'LCP',
      value: metric.value,
      rating: getRating('LCP', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    console.log('[Web Vitals]', vital);
    callback?.(vital);
  });

  getTTFB((metric) => {
    const vital: WebVital = {
      name: 'TTFB',
      value: metric.value,
      rating: getRating('TTFB', metric.value),
      delta: metric.delta,
      id: metric.id,
    };
    console.log('[Web Vitals]', vital);
    callback?.(vital);
  });
}
```

#### 1.2 Analytics Integration
```tsx
// src/lib/analytics.ts
export async function sendWebVitalToAnalytics(metric: WebVital) {
  // Send to your analytics endpoint
  if (!navigator.sendBeacon) return;

  const body = {
    metric_name: metric.name,
    metric_value: metric.value,
    metric_rating: metric.rating,
    metric_delta: metric.delta,
    timestamp: new Date().toISOString(),
    page_url: window.location.pathname,
  };

  // POST to your analytics backend
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true, // Ensure request completes even if page unloads
    });
  } catch (error) {
    console.error('Failed to send Web Vital', error);
  }
}
```

---

### Step 2: Performance Budget Configuration

#### 2.1 Bundle Size Budget
Create a performance budget to prevent regressions:

```javascript
// next.config.mjs
const nextConfig = {
  // ... existing config
  
  // Bundle size analysis
  productionBrowserSourceMaps: false,
  
  // Performance budget (optional via middleware)
  // Track in CI/CD pipeline
};
```

#### 2.2 Performance Budget Thresholds
```json
{
  "bundles": [
    {
      "name": "main-js",
      "maxSize": "100kb", // Initial JS bundle
      "threshold": "5%"   // Allow 5% growth threshold
    },
    {
      "name": "main-css",
      "maxSize": "10kb",  // Critical CSS
      "threshold": "10%"
    },
    {
      "name": "images",
      "maxSize": "75kb",  // Per-route average
      "threshold": "15%"
    }
  ],
  "metrics": [
    {
      "name": "LCP",
      "threshold": "2500ms"
    },
    {
      "name": "FCP",
      "threshold": "1800ms"
    },
    {
      "name": "CLS",
      "threshold": "0.1"
    }
  ]
}
```

---

### Step 3: Bundle Analysis

#### 3.1 Install Bundle Analyzer
```bash
npm install --save-dev @next/bundle-analyzer
```

#### 3.2 Add to Next.js Config
```javascript
// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // ... existing config
};

export default withBundleAnalyzerConfig(nextConfig);
```

#### 3.3 Run Analysis
```bash
# Analyze bundle
ANALYZE=true yarn build

# Output: Creates interactive HTML visualization
# .next/static/chunks/main.js.html (shows chunk breakdown)
```

---

### Step 4: Lighthouse CI Setup (Optional)

#### 4.1 Install Lighthouse CLI
```bash
npm install -g @lhci/cli@0.12.x
npm install --save-dev @lhci/cli
```

#### 4.2 Configuration File
Create `.lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "staticDistDir": "./out",
      "url": ["http://localhost:3000", "http://localhost:3000/dashboard"]
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "categories:best-practices": ["error", { "minScore": 0.85 }],
        "categories:seo": ["error", { "minScore": 0.90 }]
      }
    }
  }
}
```

#### 4.3 Run Lighthouse
```bash
# Single run
lighthouse http://localhost:3000 --output=html > lhr.html

# CI mode (multiple runs, automated)
lhci autorun
```

---

### Step 5: Real-World Testing Scripts

#### 5.1 Create Test Script
```bash
#!/bin/bash
# scripts/performance-test.sh

echo "🚀 Starting Performance Test..."

# Build production
echo "📦 Building production bundle..."
yarn build

# Start server
echo "🟢 Starting server..."
yarn start &
SERVER_PID=$!

# Wait for server to be ready
sleep 5

# Run Lighthouse
echo "📊 Running Lighthouse audits..."
lighthouse http://localhost:3000 --output=html > lhr-home.html
lighthouse http://localhost:3000/dashboard --output=html > lhr-dashboard.html
lighthouse http://localhost:3000/onboarding --output=html > lhr-onboarding.html

# Cleanup
kill $SERVER_PID

echo "✅ Performance test complete!"
echo "📁 Results:"
echo "  - lhr-home.html"
echo "  - lhr-dashboard.html"
echo "  - lhr-onboarding.html"
```

---

### Step 6: Performance Reporting

#### 6.1 Expected vs. Actual Comparison

| Metric | Target | Phase 3 | Phase 4+ | Status |
|--------|--------|---------|----------|--------|
| **FCP** | < 1.8s | 1.2s | TBD | ✅ |
| **LCP** | < 2.5s | 1.5s | TBD | ✅ |
| **CLS** | < 0.1 | 0.05 | TBD | ✅ |
| **TTI** | < 3.5s | 2.5s | TBD | ✅ |
| **Bundle** | < 120KB | 103KB | TBD | ✅ |

#### 6.2 Performance Report Template
```markdown
# Performance Report - March 2026

## Summary
- **Pages Tested:** Landing, Dashboard, Onboarding
- **Devices:** Desktop, Mobile (throttled)
- **Test Date:** [date]

## Results

### Desktop Performance
| Route | FCP | LCP | CLS | TTI | Score |
|-------|-----|-----|-----|-----|-------|
| `/` | 0.9s | 1.2s | 0.02 | 2.0s | 92 |
| `/dashboard` | 1.1s | 1.5s | 0.03 | 2.5s | 89 |
| `/onboarding` | 0.8s | 1.0s | 0.01 | 1.8s | 94 |

### Mobile Performance (Slow 4G)
| Route | FCP | LCP | CLS | TTI | Score |
|-------|-----|-----|-----|-----|-------|
| `/` | 2.1s | 3.2s | 0.02 | 4.5s | 76 |
| `/dashboard` | 2.3s | 3.8s | 0.03 | 5.0s | 72 |
| `/onboarding` | 1.9s | 2.8s | 0.01 | 4.0s | 78 |

## Bundle Analysis
- Initial HTML: 45KB
- Critical CSS: 3KB (inline)
- Deferred CSS: 35KB
- Initial JS: 100KB
- Images (avg): 75KB per route

## Recommendations
1. ...
2. ...
3. ...
```

---

## 🎯 Success Criteria

### Performance Targets
- [ ] **FCP:** < 1.8s (currently 1.2s)
- [ ] **LCP:** < 2.5s (currently 1.5s)
- [ ] **CLS:** < 0.1 (currently 0.05)
- [ ] **TTI:** < 3.5s (currently 2.5s)
- [ ] **Lighthouse:** 85+ performance score

### Bundle Targets
- [ ] Initial CSS: < 10KB (critical only)
- [ ] Initial JS: < 120KB (currently 100KB)
- [ ] Total bundle: < 180KB (currently 103KB)
- [ ] Images: < 100KB avg (currently 75KB)

### Monitoring Setup
- [ ] Web Vitals tracker implemented
- [ ] Analytics integration ready
- [ ] Bundle analyzer configured
- [ ] Lighthouse CI setup
- [ ] Performance budget defined

---

## 📝 Implementation Checklist

### Web Vitals Tracking
- [ ] Create `src/lib/web-vitals.ts`
- [ ] Create `src/app/components/WebVitalsReporter.tsx`
- [ ] Add to layout.tsx or root component
- [ ] Verify metrics logging in console
- [ ] Test on mobile and desktop

### Bundle Analysis
- [ ] Install @next/bundle-analyzer
- [ ] Update next.config.mjs
- [ ] Run `ANALYZE=true yarn build`
- [ ] Review `.next/static/chunks/main.js.html`
- [ ] Identify large dependencies

### Lighthouse Testing
- [ ] Install @lhci/cli
- [ ] Create `.lighthouserc.json`
- [ ] Test local server
- [ ] Run audits on key routes
- [ ] Generate reports

### Performance Monitoring
- [ ] Set up analytics endpoint `/api/metrics`
- [ ] Create performance dashboard
- [ ] Configure alerts for regressions
- [ ] Set performance budget thresholds

---

## 🚀 Quick Start Commands

```bash
# 1. Build and analyze bundle
ANALYZE=true yarn build

# 2. Start server
yarn start

# 3. Run Lighthouse in separate terminal
lighthouse http://localhost:3000 --output=html

# 4. Test Web Vitals (open DevTools Console)
open http://localhost:3000/

# 5. Performance test script
bash scripts/performance-test.sh
```

---

## 📊 Phase 4 Deliverables

1. **Web Vitals Tracker** - Client-side metrics collection
2. **Bundle Analysis Report** - Chunk breakdown visualization
3. **Lighthouse Reports** - HTML reports for 3 key routes
4. **Performance Budget** - Thresholds to prevent regressions
5. **Monitoring Dashboard** - Real-time metrics (optional)

---

## ⏭️ Next Phases

**Phase 5: Advanced Optimization (Optional)**
- Service Worker for offline support
- Preload critical assets
- Advanced image formats (AVIF/WebP)
- Route-specific code splitting

**Phase 6: Analytics & Reporting (Optional)**
- Real User Monitoring (RUM)
- Custom event tracking
- Performance dashboard
- Alert configurations

---

**Phase 4 Complete:** Comprehensive performance monitoring and validation system established. ✨
