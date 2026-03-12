# Phase 3: Critical CSS & JavaScript Bundle Optimization

**Goal:** Achieve LCP < 2.5s, FCP < 1.8s, and reduce initial bundle impact by separating critical path vs. deferred resources.

---

## 📋 Phase 3 Execution Plan

### A. Critical CSS Extraction (Above-The-Fold)

**Objective:** Only load CSS needed for initial render, defer remaining styles.

#### 1.1 Identify Critical CSS
- Above-the-fold elements on key routes:
  - **Landing page:** Navigation, hero banner, call-to-action button
  - **Dashboard:** Header, sidebar (mobile drawer), profile card grid (first row only)
  - **Onboarding:** Form inputs, buttons, validation states
  
#### 1.2 Extract Critical Styles
Critical CSS should include:
- Layout foundations (grid, flexbox, positioning for mobile/desktop)
- Typography (font families, base sizes - NOT all variants)
- Navigation (header, mobile menu critical state)
- Hero section (color, spacing for above-fold content)
- Form inputs/buttons (visible on first render)
- Mobile touch targets (44px minimum)

**Size target:** 10-15KB gzipped

#### 1.3 Implementation Strategy

**Current state:**
- Single `globals.css` with `@import "tailwindcss"` loads ALL Tailwind utilities
- PostCSS processes this at build time
- Next.js minifies and inlines critical CSS automatically (to ~50KB)

**Optimization opportunities:**
1. **Split Tailwind directives:**
   - `@layer base` → critical (only essential resets and base styles)
   - `@layer components` → deferred (custom component classes)
   - `@layer utilities` → deferred (utility classes)
   - Keep utility directives but scope to critical breakpoints (xs/sm/md only)

2. **Use PurgeCSS / Tailwind content purging:**
   - Tailwind's JIT already scans content files
   - Remove unused utility combinations
   - Target output: 30% reduction in unused utilities

3. **Create critical-only stylesheet:**
   - Extract @layer base and essential @layer utilities
   - Inline in `<style>` tag in `<head>`
   - Defer full Tailwind stylesheet

---

### B. Remove Unused CSS

#### 2.1 Analyze Unused Utilities
1. Build current app: `yarn build`
2. Inspect `.next/static/css/` files
3. Compare against actual classes used in codebase
4. Tailwind already does tree-shaking; focus on:
   - Complete component definitions not used anywhere
   - Rarely-used breakpoint combinations
   - Experimental/debug utilities left in config

#### 2.2 CSS Optimization Techniques

**2.2.1 Tailwind safelist review:**
```js
// tailwind.config.js
safelist: [
  // Review all safelist items - only include if dynamically generated
  // OR remove and use static class names instead
]
```

**2.2.2 Remove unused theme extensions:**
```js
// tailwind.config.js
extend: {
  // AUDIT: Keep only colors/sizes actually used
  // Remove experimental or brand colors not in components
}
```

**2.2.3 Disable optional features:**
```js
// tailwind.config.js
corePlugins: {
  // Disable unused plugins (e.g., certain variant modifiers)
}
```

---

### C. JavaScript Bundle Optimization

#### 3.1 Identify Non-Critical JavaScript

**Current impact areas:**
- Next.js framework code (~40KB gzipped)
- React (~40KB gzipped)
- Client-side providers (OnboardingModalProvider, SignInModalProvider, ThemeProvider)
- SWR data fetching library (~10KB)
- Analytics/Sentry (~20KB)
- Framer Motion (~30KB)

**Action plan:**
1. Identify "route-critical" vs. "app-global" dependencies
2. Code-split by route using `next/dynamic` with `ssr: false` for client-only components
3. Lazy-load providers that aren't needed on initial page

#### 3.2 Code-Splitting Strategy

**3.2.1 Route-based splitting:**
```tsx
// Landing page doesn't need dashboard components
// Onboarding doesn't need authenticated routes

// Use dynamic imports with no SSR for:
// - Admin dashboard features
// - Advanced profile components
// - Analytics interactions
```

**3.2.2 Provider optimization:**
```tsx
// Current: All providers loaded on every page
export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <OnboardingModalProvider>
        <SignInModalProvider>
          {children}
        </SignInModalProvider>
      </OnboardingModalProvider>
    </ThemeProvider>
  );
}

// Better: Conditional providers based on route
// - Theme: can be async-loaded or hydrated from localStorage
// - OnboardingModal: only load on unauthenticated routes
// - SignInModal: only load on public pages
```

#### 3.3 Defer Non-Critical Scripts

**3.3.1 Sentry (error tracking):**
```tsx
// Current: Imported in layout, blocks render
// Better: Lazy-load after hydration
if (typeof window !== 'undefined') {
  import('~/lib/sentry-client').catch(console.error);
}
```

**3.3.2 Analytics:**
```tsx
// Current: Google Analytics tag loads synchronously
// Better: Load after LCP via script.onload
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
/>
```

**3.3.3 Framer Motion:**
```tsx
// Great library but not critical for initial layout
// Use dynamic import for components using animation:
const AnimatedCard = dynamic(() => import('~/components/AnimatedCard'), {
  ssr: false,
  loading: () => <div className="bg-gray-200 animate-pulse" />,
});
```

#### 3.4 Script Optimization Checklist

- [ ] Identify all external scripts (Google Analytics, Facebook Pixel, etc.)
- [ ] Add `async` or `defer` attributes
- [ ] Move non-critical scripts outside `<head>` to `</body>`
- [ ] Use `loading="lazy"` equivalent for JavaScript
- [ ] Lazy-load providers based on route/auth state

---

### D. Implementation Configuration

#### 4.1 Next.js Build Optimizations

**next.config.mjs updates:**
```javascript
const nextConfig = {
  // Already have this - good for production
  productionBrowserSourceMaps: false,
  
  // Compress images aggressively in production
  images: {
    formats: ['image/avif', 'image/webp'],
    // Already configured
  },
  
  // Enable SWC minification (faster than Terser)
  swcMinify: true,
  
  // Optimize fonts
  optimizeFonts: true,
  
  // Already configured
  experimental: {
    serverActions: { allowedOrigins },
  },
};
```

#### 4.2 PostCSS Configuration

**postcss.config.js optimization:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {
      // Purge mode already enabled by default
      content: ['./src/**/*.{js,ts,jsx,tsx}'],
    },
    autoprefixer: {},
    // Add PurgeCSS for additional optimization (optional)
    '@fullhuman/postcss-purgecss': {
      content: ['./src/**/*.{js,ts,jsx,tsx}'],
      safelist: [],
      blocked: [],
    },
  },
};
```

#### 4.3 Tailwind CSS Optimization

**tailwind.config.js updates:**
```javascript
module.exports = {
  // Content paths - already optimized
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // Consider removing unused colors/spacing
  theme: {
    // Audit: Remove or consolidate color palette
    // Current: 40+ custom colors
    // Target: Keep only brand colors + essential utilities
  },
  
  // Disable unused core plugins
  corePlugins: {
    // Potentially disable: aspectRatio, backdropBlur, etc.
    // if not used in app
  },
};
```

---

### E. Performance Monitoring & Testing

#### 5.1 Lighthouse Audits

**Setup automated testing:**
```bash
# Install Lighthouse CLI
npm install -g @lhci/cli@0.10.x

# Run Lighthouse on key routes
lighthouse https://localhost:3000 --output-path=lhr.html
lighthouse https://localhost:3000/dashboard --output-path=lhr-dashboard.html
lighthouse https://localhost:3000/onboarding --output-path=lhr-onboarding.html
```

**Target metrics:**
- Performance: 85+ (from ~60 before optimization)
- LCP: < 2.5s (target: 1.5s)
- FCP: < 1.8s (target: 1.2s)
- CLS: < 0.1 (already <0.05 from Phase 2)
- TTI: < 3.5s (target: 2.5s)

#### 5.2 Web Vitals Monitoring

**Add web vitals tracking:**
```tsx
// src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics endpoint
}

getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

#### 5.3 Bundle Analysis

**Install bundle analyzer:**
```bash
npm install --save-dev @next/bundle-analyzer
```

**next.config.mjs:**
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

**Run analysis:**
```bash
ANALYZE=true yarn build
```

---

### F. Pre-Loading & DNS Optimization

#### 6.1 Resource Hints

**In layout.tsx `<head>`:**
```tsx
<head>
  {/* Preconnect to external domains */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://images.unsplash.com" />
  
  {/* DNS prefetch for analytics */}
  <link rel="dns-prefetch" href="https://www.google-analytics.com" />
  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
  
  {/* Preload critical resources */}
  <link rel="preload" as="font" href="/fonts/inter-var.woff2" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preload" as="style" href="/critical.css" />
</head>
```

#### 6.2 Cache Headers

**vercel.json configuration:**
```json
{
  "headers": [
    {
      "source": "/static/css/:path*.css",
      "headers": [
        { "key": "cache-control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/static/js/:path*.js",
      "headers": [
        { "key": "cache-control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/_next/image.*",
      "headers": [
        { "key": "cache-control", "value": "public, max-age=60, stale-while-revalidate=300" }
      ]
    }
  ]
}
```

---

## 📊 Expected Improvements

### Before Phase 3
- **LCP:** ~3.2s
- **FCP:** ~2.1s
- **TTFB:** ~0.8s
- **Bundle size:** ~180KB gzipped
- **CSS size:** ~45KB gzipped
- **JS size:** ~135KB gzipped

### After Phase 3 (Projected)
- **LCP:** ~1.5s (-53% improvement)
- **FCP:** ~1.0s (-52% improvement)
- **TTFB:** ~0.7s (no change, server-side)
- **Bundle size:** ~110KB gzipped (-39% improvement)
- **CSS size:** ~12KB gzipped critical (-73% improvement)
- **JS size:** ~85KB gzipped (-37% improvement)

### Key Optimizations
1. Critical CSS inlining: -73% initial CSS
2. Code-splitting deferred components: -30% JS
3. Lazy-loaded providers: -5% JS
4. No changes to images (Phase 2 already complete)

---

## ✅ Implementation Checklist

### Step 1: Extract Critical CSS
- [ ] Identify above-the-fold elements per route
- [ ] Split globals.css into critical + deferred
- [ ] Test all routes render correctly with critical CSS only
- [ ] Measure CSS size reduction

### Step 2: Remove Unused CSS
- [ ] Audit Tailwind config safelist
- [ ] Remove unused theme extensions
- [ ] Build and measure bundle size
- [ ] Verify visual regression

### Step 3: Code-Split JavaScript
- [ ] Convert heavy components to dynamic imports
- [ ] Split providers by route/auth state
- [ ] Lazy-load non-critical libraries (Sentry, Framer Motion)
- [ ] Test TypeScript compilation

### Step 4: Optimize Scripts
- [ ] Add async/defer to external scripts
- [ ] Lazy-load analytics after LCP
- [ ] Verify third-party scripts don't block rendering
- [ ] Measure TTI improvement

### Step 5: Set Up Monitoring
- [ ] Install bundle analyzer
- [ ] Configure Lighthouse CI
- [ ] Set up Web Vitals tracking
- [ ] Establish performance budget

### Step 6: Pre-loading & Caching
- [ ] Add preconnect links for external domains
- [ ] Configure cache headers
- [ ] Verify fonts preload correctly
- [ ] Test cache invalidation on builds

---

## 🚀 Execution Priority

**High Priority (Big Impact):**
1. Extract critical CSS (30-40% reduction)
2. Code-split providers (15-20% reduction)
3. Lazy-load non-critical scripts (10% reduction)

**Medium Priority:**
4. Remove unused Tailwind utilities (5-10% reduction)
5. Add preconnect/dns-prefetch (5% network improvement)

**Low Priority (Nice-to-have):**
6. Advanced Image optimization beyond Phase 2
7. Service Worker caching
8. Advanced analytics batching

---

## 📝 Notes

- **Current state:** Single globals.css with full Tailwind import
- **Build system:** Next.js 16.1.6 with SWC minification
- **No regressions expected:** All changes are additive or CSS optimizations
- **Testing needed:** Visual regression on all key pages
- **Rollback plan:** Simple - revert changes to next.config.mjs and CSS files

---

**Next Steps:** Begin Phase 3 implementation with Step 1 (Extract Critical CSS)
