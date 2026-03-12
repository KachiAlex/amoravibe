# Mobile Optimization - Next Steps Checklist

## 🎯 Immediate Actions (Ready to Execute)

### 1. Fix Dev Server (Prerequisite)
**Status:** caniuse-lite dependency issue persists  
**Workaround:** If server still won't start, try:
```bash
# Clean all caches
yarn cache clean
rm -rf node_modules yarn.lock
yarn install

# Update browserslist database
npx update-browserslist-db@latest
```

**Then verify server starts:**
```bash
yarn dev
```

### 2. Run Mobile Audit Scripts (Once Server Running)
```bash
# Capture device screenshots
node scripts/mobile_audit.js

# Collect performance metrics
node scripts/audit-mobile-perf.js
```

**Results Location:**
- Screenshots: `test-results/mobile-screenshots/`
- Metrics: `test-results/mobile-audits/`

---

## 📱 High Priority - Component Refactoring

### Dashboard Layout
**File:** `apps/web/src/app/dashboard/page.tsx`
**Current:** Likely desktop-first layout with sidebar  
**Target:** Sidebar → drawer pattern on mobile

```tsx
// Pseudo-code pattern
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex flex-col md:flex-row gap-0">
      {/* Mobile drawer or desktop sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        className="w-64 md:relative fixed md:block"
      />
      
      {/* Main content - always visible, responsive padding */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Dashboard content */}
      </main>
    </div>
  );
}
```

### Form Components
**Affected Files:** All forms in `apps/web/src/` (auth, profile, etc.)
**Changes Needed:**
- Add responsive label positioning (above on mobile, side on desktop)
- Ensure inputs are 100% width on mobile, auto on desktop
- Stack form sections vertically on mobile

```tsx
export function FormField({ label, ...props }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
      <label className="w-full md:w-32 text-sm font-medium">
        {label}
      </label>
      <input 
        {...props}
        className="w-full px-3 py-2 border rounded"
      />
    </div>
  );
}
```

### Feed/Grid Components
**Target:** Profile cards, discovery feed  
**Pattern:** Responsive grid columns

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} item={item} />
  ))}
</div>
```

---

## 🖼️ Image Optimization

### Convert to next/image
**Location:** All `<img>` tags in `apps/web/src/`

**Before:**
```tsx
<img src="/banner.jpg" alt="Banner" className="w-full" />
```

**After:**
```tsx
import Image from 'next/image';
import { ImageConfigs } from '@/utils/image-optimize';

<Image
  {...ImageConfigs.hero('/banner.jpg', 'Banner')}
  width={1920}
  height={1080}
/>
```

### Image Checklist
- [ ] Hero/banner images → ImageConfigs.hero()
- [ ] Profile/avatar images → ImageConfigs.thumbnail()
- [ ] Feed/grid images → ImageConfigs.card()
- [ ] Background images → ImageConfigs.background()
- [ ] All below-fold images → Add `loading="lazy"`

---

## ⚡ Performance Optimization

### CSS Optimization
**Checklist:**
- [ ] Run `yarn build` and check CSS bundle size
- [ ] Enable CSS purging in `tailwind.config.js` (production)
- [ ] Defer non-critical CSS

**Verify in `tailwind.config.js`:**
```js
content: [
  './src/**/*.{js,ts,jsx,tsx}',
  '../../packages/ui/**/*.{js,ts,jsx,tsx}',
],
```

### JavaScript Optimization
**Steps:**
1. **Run Lighthouse:** DevTools → Lighthouse → Mobile
2. **Check code-splitting:** Routes should load separate chunks
3. **Defer analytics:** Move tracking code to `<script defer>`
4. **Lazy-load modals:** Use dynamic imports

```tsx
import dynamic from 'next/dynamic';

const SignInModal = dynamic(() => import('@/components/SignInModal'), {
  loading: () => <LoadingSpinner />
});
```

---

## 🧪 Testing & Validation

### Lighthouse Audit
```bash
# Run locally
npx lighthouse http://localhost:4000 --view

# Or check in Chrome DevTools
# F12 → Lighthouse → Generate report (Mobile preset)
```

**Target Scores:**
- Performance: ≥ 85
- Accessibility: ≥ 90
- Best Practices: ≥ 85
- SEO: ≥ 90

### Mobile Device Testing
```bash
# Test on actual device
# On same WiFi as dev machine
# Visit http://<your-ip>:4000

# Or use Playwright device emulation
node scripts/mobile_audit.js
```

### Responsive Testing
**Browser DevTools Method:**
- F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- Test all breakpoints: 320px, 640px, 768px, 1024px

---

## 📊 Monitoring Setup

### Performance Metrics Tracking
**File:** `apps/web/src/utils/performance.ts` (create if needed)

```ts
export function reportMetrics() {
  if ('web-vital' in window) {
    const vitals = window['web-vital'];
    console.log(`LCP: ${vitals.lcp}ms`);
    console.log(`FCP: ${vitals.fcp}ms`);
    console.log(`CLS: ${vitals.cls}`);
  }
}
```

### Sentry Integration
**Note:** Sentry config already exists in codebase
- Monitor mobile errors
- Track performance traces
- Set up release tracking

---

## 📋 Priority Order (Recommended)

### Phase 1: Foundation ✓ DONE
- [x] Viewport meta tags
- [x] Responsive breakpoints
- [x] Fluid typography/spacing
- [x] Accessibility (touch targets, focus)

### Phase 2: Component Refactoring (NEXT)
- [ ] Dashboard layout
- [ ] Form components
- [ ] Feed/grid components
- [ ] Navigation drawer

### Phase 3: Image Optimization
- [ ] Convert all images to next/image
- [ ] Add responsive sizes
- [ ] Implement lazy-loading

### Phase 4: Performance
- [ ] CSS optimization
- [ ] JavaScript code-splitting
- [ ] Caching headers
- [ ] Critical CSS extraction

### Phase 5: Testing & Monitoring
- [ ] Lighthouse audits
- [ ] Playwright E2E tests
- [ ] Real user monitoring (RUM)
- [ ] Performance budgets

---

## Resources & References

📚 **Documentation:**
- [Mobile Responsive Design Guide](./MOBILE_RESPONSIVE_GUIDE.md)
- [Mobile Optimization Status](./MOBILE_OPTIMIZATION_STATUS.md)

🔗 **External:**
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)
- [Web.dev Mobile Checklist](https://web.dev/mobile-ux-checklist/)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

## Need Help?

**Common Issues:**

**Q: Dev server won't start**  
A: See "Fix Dev Server" section above. Usually caniuse-lite cache issue.

**Q: Images not responsive**  
A: Use `getResponsiveSizes()` from image-optimize.ts; set width/height on next/image.

**Q: Tailwind classes not applying**  
A: Check content[] paths in tailwind.config.js includes all source files.

**Q: Touch targets still too small**  
A: Verify globals.css includes 44px min-height/width; add custom className if needed.

---

**Last Updated:** This session  
**Assigned To:** You! 🚀
