# Mobile Optimization: Quick-Start Code Patterns

Copy & adapt these patterns to your components.

---

## 1. Responsive Containers

### Basic Responsive Padding
```tsx
// Mobile: 1rem, tablet: 1.5rem, desktop: 2rem
<div className="px-4 md:px-6 lg:px-8">
  {children}
</div>

// Or use fluid spacing utility
<div className="p-responsive">
  {children}
</div>
```

### Full-Width Container with Max-Width
```tsx
<div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
  {children}
</div>
```

### Flex Stack (Horizontal on Desktop, Vertical on Mobile)
```tsx
// Stack vertically on mobile, horizontally on desktop
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Main</div>
</div>
```

---

## 2. Responsive Typography

### Heading Sizes
```tsx
// Fluid font sizes that scale with viewport
<h1 className="text-fluid-3xl font-bold">Page Title</h1>
<h2 className="text-fluid-2xl font-semibold">Section Title</h2>
<h3 className="text-fluid-xl font-medium">Subsection</h3>
<p className="text-fluid-base">Body text</p>
```

### Text Alignment & Spacing
```tsx
// Text center on mobile, left on desktop
<h1 className="text-center md:text-left text-fluid-2xl">
  Responsive Title
</h1>

// Adjust line height for readability
<p className="text-fluid-base leading-relaxed md:leading-loose">
  Long-form text is more readable with generous line height on mobile
</p>
```

---

## 3. Forms & Input Fields

### Single Input Field
```tsx
<div className="w-full flex flex-col gap-2">
  <label className="text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    placeholder="you@example.com"
    className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
  />
</div>
```

### Multi-Column Form (Stack on mobile)
```tsx
<form className="space-y-4 md:space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    <div>
      <label className="text-sm font-medium">First Name</label>
      <input type="text" className="w-full mt-1 px-3 py-2 border rounded" />
    </div>
    <div>
      <label className="text-sm font-medium">Last Name</label>
      <input type="text" className="w-full mt-1 px-3 py-2 border rounded" />
    </div>
  </div>

  <div>
    <label className="text-sm font-medium">Bio</label>
    <textarea className="w-full mt-1 px-3 py-2 border rounded" rows={4} />
  </div>

  <button className="w-full md:w-auto px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700">
    Submit
  </button>
</form>
```

### Button Group (Stack on mobile, horizontal on desktop)
```tsx
<div className="flex flex-col md:flex-row gap-3 md:gap-4">
  <button className="w-full md:w-auto px-4 py-2 bg-violet-600 text-white rounded">
    Primary
  </button>
  <button className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded">
    Secondary
  </button>
</div>
```

---

## 4. Cards & Grid Layouts

### Responsive Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {items.map(item => (
    <Card key={item.id} item={item} />
  ))}
</div>

// Card component inside
function Card({ item }) {
  return (
    <div className="p-4 md:p-6 border rounded-lg hover:shadow-lg transition">
      <img src={item.image} alt={item.title} className="w-full aspect-video object-cover rounded" />
      <h3 className="text-fluid-lg font-semibold mt-4">{item.title}</h3>
      <p className="text-fluid-base text-gray-600 mt-2">{item.description}</p>
    </div>
  );
}
```

### Two-Column Layout with Sidebar
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
  {/* Sidebar - appears below on mobile */}
  <aside className="md:col-span-1 order-2 md:order-1">
    <Sidebar />
  </aside>

  {/* Main content */}
  <main className="md:col-span-2 order-1 md:order-2">
    {children}
  </main>
</div>
```

---

## 5. Images with Responsive Sizing

### Hero Image
```tsx
import Image from 'next/image';
import { ImageConfigs } from '@/utils/image-optimize';

<Image
  {...ImageConfigs.hero('/hero-banner.jpg', 'Hero Banner')}
  width={1920}
  height={600}
  priority
/>
```

### Profile / Avatar Image
```tsx
<Image
  {...ImageConfigs.thumbnail('/profile.jpg', 'Profile')}
  width={200}
  height={200}
  className="rounded-full"
/>
```

### Card Image with Responsive Sizes
```tsx
<Image
  src="/card-image.jpg"
  alt="Card"
  width={600}
  height={400}
  className="w-full aspect-video object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
/>
```

### Background Image (CSS)
```tsx
<div 
  className="relative w-full h-64 md:h-96 bg-cover bg-center rounded-lg"
  style={{
    backgroundImage: "url('/background.jpg')"
  }}
>
  {children}
</div>
```

---

## 6. Navigation & Drawer

### Top Navigation Bar
```tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-violet-600">Logo</div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          <a href="/" className="text-gray-700 hover:text-violet-600">Home</a>
          <a href="/discover" className="text-gray-700 hover:text-violet-600">Discover</a>
          <a href="/profile" className="text-gray-700 hover:text-violet-600">Profile</a>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-gray-50 px-4 py-4 space-y-3 border-t">
          <a href="/" className="block text-gray-700 hover:text-violet-600 py-2">Home</a>
          <a href="/discover" className="block text-gray-700 hover:text-violet-600 py-2">Discover</a>
          <a href="/profile" className="block text-gray-700 hover:text-violet-600 py-2">Profile</a>
        </nav>
      )}
    </header>
  );
}
```

### Mobile Drawer Sidebar
```tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile drawer toggle */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-2 bg-violet-600 text-white rounded-lg"
      >
        {drawerOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative w-64 h-full bg-white border-r border-gray-200 z-40
        transform transition-transform md:transform-none
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <nav className="p-4 md:p-6 space-y-3">
          {/* Sidebar items */}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
```

---

## 7. Common Component Patterns

### Button with Minimum Touch Target
```tsx
<button className="min-h-12 min-w-12 px-4 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 transition">
  Click Me
</button>

// Or create a reusable button component
export function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="min-h-12 min-w-12 px-4 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 active:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
```

### Modal / Overlay (Full-screen on mobile)
```tsx
export function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-t-lg md:rounded-lg shadow-lg z-50">
        {children}
      </div>
    </>
  );
}
```

---

## 8. Accessibility Checklist

```tsx
// ✓ Always include alt text for images
<img src="..." alt="Descriptive text" />

// ✓ Use semantic HTML
<button>Click me</button>  // ✓ Good
<div onClick={...}>Click me</div>  // ✗ Bad

// ✓ Ensure minimum 44×44px touch targets (already enforced in globals.css)
<button className="px-4 py-3">Submit</button>

// ✓ Focus-visible styles for keyboard navigation
<input className="focus-visible:outline-2 focus-visible:outline-violet-500" />

// ✓ Use aria-label for icon-only buttons
<button aria-label="Close menu" className="p-2">
  <X size={24} />
</button>

// ✓ Use aria-expanded for toggles
<button aria-expanded={isOpen} onClick={toggle}>
  Menu
</button>
```

---

## 9. Performance Optimization Patterns

### Lazy-Load Images Below Fold
```tsx
<Image
  src="/image.jpg"
  alt="Image"
  loading="lazy"
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

### Code-Split Large Components
```tsx
import dynamic from 'next/dynamic';

const HeavyDashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <div>Loading...</div>
});
```

### Defer Non-Critical Scripts
```tsx
// In _document.tsx or layout.tsx
<script
  src="https://analytics.example.com/script.js"
  defer
  strategy="lazyOnload"
/>
```

---

## 10. Testing Mobile Responsiveness

### Debug Breakpoints
```tsx
// Add this to see current breakpoint (remove in production)
function BreakpointDebug() {
  return (
    <div className="fixed bottom-4 left-4 z-50 px-2 py-1 bg-black text-white text-xs rounded">
      <span className="block md:hidden">xs</span>
      <span className="hidden md:block lg:hidden">md</span>
      <span className="hidden lg:block xl:hidden">lg</span>
      <span className="hidden xl:block 2xl:hidden">xl</span>
      <span className="hidden 2xl:block">2xl</span>
    </div>
  );
}
```

### Responsive Testing Checklist
```
□ Test on 320px (iPhone SE)
□ Test on 640px (iPhone 12)
□ Test on 768px (iPad)
□ Test on 1024px (iPad Pro)
□ Test on 1280px+ (Desktop)
□ Test with Chrome DevTools device emulation
□ Test touch interactions (tap, long-press)
□ Test keyboard navigation (Tab, Enter, Escape)
□ Test with screen reader (NVDA, JAWS, VoiceOver)
```

---

## Quick Tips

- **Use `clamp()` for fluid sizing:** `font-size: clamp(1rem, 2vw, 1.125rem)`
- **Mobile-first:` No prefix = mobile, `md:` = tablet, `lg:` = desktop
- **Never set min-width on buttons:** Let content and padding size them
- **Always test on real devices** before shipping
- **Use Lighthouse** to catch performance regressions
- **Check WCAG 2.1 AA compliance** for accessibility

---

**Need help?** See [MOBILE_NEXT_STEPS.md](./MOBILE_NEXT_STEPS.md) for priorities and [MOBILE_RESPONSIVE_GUIDE.md](./MOBILE_RESPONSIVE_GUIDE.md) for detailed patterns.
