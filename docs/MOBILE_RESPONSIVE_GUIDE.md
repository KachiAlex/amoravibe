# Mobile Responsive Design Guide

## Overview
This document outlines mobile-first responsive guidelines for Amoravibe. All components should follow these patterns.

---

## 1. Breakpoints & Media Queries
Use Tailwind's responsive prefix syntax (mobile-first):
- **Base**: 320px–639px (mobile)
- **`sm:`**: 640px–767px (tablet)
- **`md:`**: 768px–1023px (tablet large)
- **`lg:`**: 1024px–1279px (desktop)
- **`xl:`**: 1280px+ (desktop large)

**Example:**
```tsx
<div className="px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg">
  Content scales fluidly across devices
</div>
```

---

## 2. Fluid Typography
Use Tailwind's built-in fluid font sizes (with clamp()):
```tsx
<h1 className="text-fluid-4xl">Adaptive heading</h1>
<p className="text-fluid-base">Readable paragraph text</p>
```

Or use custom `.text-fluid-*` utilities from `globals.css` for fallback support.

---

## 3. Touch Targets & Accessibility
- Minimum 44×44px for interactive elements (buttons, links, inputs).
- Included in base styles; ensure no element is smaller.
- Always include focus states:
  ```css
  button:focus-visible {
    outline: 2px solid var(--brand-violet-500);
    outline-offset: 2px;
  }
  ```

---

## 4. Spacing & Layout
Use Tailwind's utility classes with fluid values:
```tsx
<div className="p-4 sm:p-6 md:p-8 lg:p-12">
  {/* Padding scales with viewport */}
</div>
```

For columns:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## 5. Images & Media
Use `next/image` for optimized responsive images:
```tsx
import Image from 'next/image';

<Image
  src="/profile.jpg"
  alt="User profile"
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={false}
  quality={85}
/>
```

---

## 6. Common Patterns

### Form Inputs
```tsx
<input
  type="text"
  className="w-full px-3 py-2 sm:py-3 text-base rounded-lg border border-gray-300 focus-visible:outline focus-visible:outline-2"
/>
```

### Button Stack
```tsx
<div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
  <button className="flex-1 px-4 py-2 sm:py-3">Action 1</button>
  <button className="flex-1 px-4 py-2 sm:py-3">Action 2</button>
</div>
```

### Navbar (Mobile Menu)
Use CSS Grid or Flexbox with responsive visibility:
```tsx
<nav className="hidden md:flex items-center gap-6">
  {/* Desktop nav */}
</nav>
<nav className="md:hidden">
  {/* Mobile hamburger menu */}
</nav>
```

---

## 7. Performance Checklist
- [ ] Images are optimized with `next/image`
- [ ] Lazy-load offscreen images (`loading="lazy"`)
- [ ] Remove unused CSS with PurgeCSS / Tailwind
- [ ] Defer non-critical JS (async/defer on scripts)
- [ ] Preconnect to external domains in `layout.tsx`
- [ ] Use server components where possible

---

## 8. Testing Mobile UX
1. **Lighthouse Audit:**
   ```bash
   npx lighthouse http://localhost:4000 --chrome-flags="--headless" --output=html
   ```

2. **Playwright Mobile Tests:**
   ```bash
   yarn workspace web test -- --viewport iphone13
   ```

3. **Manual Testing:** Emulate devices in browser DevTools (Ctrl+Shift+M in Chrome).

---

## 9. Resources
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web.dev Mobile UX](https://web.dev/mobile-ux-checklist/)
- [WCAG 2.1 Mobile Accessibility](https://www.w3.org/WAI/WCAG21/Techniques/)
