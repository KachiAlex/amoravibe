# Image Optimization Best Practices

Quick reference for optimal image implementation in AmoraVibe.

---

## 🎯 Image Optimization Checklist

Before adding images to the app, follow this checklist:

- [ ] Use `next/image` from `'next/image'`
- [ ] Provide `width` and `height` props (prevents CLS)
- [ ] Set `quality={80}` or `{85}` for general images
- [ ] Add `sizes` prop with responsive breakpoints
- [ ] Set `priority={true}` for above-fold images only
- [ ] Use `loading="lazy"` for below-fold images
- [ ] Use `loading="eager"` for above-fold images
- [ ] Add descriptive `alt` text for accessibility
- [ ] For external URLs with dynamic params, add `unoptimized={true}`

---

## 📐 Common Image Sizes

### Professional/Standard
```
Hero Banner: 1920×1080 (16:9) → quality={90}
Card Image: 400×300 (4:3) → quality={80}
Avatar: 128×128 (1:1) → quality={85}
Thumbnail: 64×64 (1:1) → quality={80}
Hero Card: 640×400 (16:10) → quality={85}
```

---

## 🔧 Image Component Patterns

### Above-The-Fold Image (Hero)
```tsx
<Image
  src="/hero-banner.jpg"
  alt="Welcome to AmoraVibe"
  width={1920}
  height={1080}
  priority={true}
  quality={90}
  loading="eager"
  className="w-full h-auto"
/>
```

### Below-The-Fold Grid (Lazy Loaded)
```tsx
<Image
  src={cardImage}
  alt={title}
  width={400}
  height={300}
  quality={80}
  priority={false}
  loading="lazy"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto object-cover"
/>
```

### Avatar/Small Circle Image
```tsx
<Image
  src={avatarUrl}
  alt={username}
  width={64}
  height={64}
  quality={85}
  loading="lazy"
  className="w-16 h-16 rounded-full object-cover"
/>
```

### Dynamic/External URL (with params)
```tsx
<Image
  src={externalUrl}  // May have params that change
  alt={description}
  width={400}
  height={300}
  quality={80}
  unoptimized={true}  // Don't optimize since URL changes
  loading="lazy"
  className="w-full h-auto"
/>
```

### Responsive Grid with Selective Priority
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map((item, index) => (
    <Image
      key={item.id}
      src={item.image}
      alt={item.name}
      width={300}
      height={400}
      quality={80}
      priority={index < 4}  // First 4 images are above-fold in 4-column
      loading={index < 4 ? "eager" : "lazy"}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    />
  ))}
</div>
```

---

## 📱 Responsive Sizes Patterns

### Single Column
```tsx
sizes="(max-width: 640px) 100vw, 100vw"
```

### 2-Column Grid  
```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
```

### 3-Column Grid
```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

### 4-Column Grid
```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
```

### Hero (Variable Width)
```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
```

---

## 💾 Quality Settings Guide

| Quality | Use Case | Savings | Quality Loss |
|---------|----------|---------|--------------|
| 75 | Behind paywall, thumbnails | 10-15% | Slight artifacts |
| 80 | General content, cards | 12% | Imperceptible |
| 85 | Avatars, important images | 8% | None |
| 90 | Hero, featured, high-res | 5% | None |
| 75-85 | Mixed (vary by use) | ~10% | Varies |

**Recommendation:** Default to `80`, use `85` for avatars, `90` for hero.

---

## ⚡ Performance Tips

### 1. Use Priority Wisely
```tsx
// DO: Only first few items in viewport
{items.map((item, i) => (
  <Image 
    priority={i < 4}  // First 4 only
    {...props}
  />
))}

// DON'T: Priority on everything
{items.map(item => (
  <Image 
    priority={true}  // Bad! Kills performance
    {...props}
  />
))}
```

### 2. Always Provide Dimensions
```tsx
// DO: Always set w×h
<Image width={400} height={300} {...} />

// DON'T: Missing dimensions = layout shift
<Image {...props} />
```

### 3. Use Correct Sizes Prop
```tsx
// DO: Tell next/image what size device has
sizes="(max-width: 640px) 100vw, 50vw"

// DON'T: Generic sizes or missing
sizes="(max-width: 800px) 100vw"  // Wrong breakpoint
<Image />  // Missing sizes entirely
```

### 4. Lazy Load Below-Fold
```tsx
// DO: Defer non-critical images
loading="lazy"

// DON'T: Load everything immediately
// (omit loading prop for default behavior)
```

### 5. Match Aspect Ratio
```tsx
// DO: Maintain visual consistency
className="aspect-[3/4] object-cover"  // Prevents squishing

// DON'T: Unpredictable aspect ratios
className="h-auto"  // May cause layout shift
```

---

## 🎨 Common Layout Patterns

### Match Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {matches.map((match, idx) => (
    <div key={match.id} className="aspect-[3/4]">
      <Image
        src={match.avatar}
        alt={match.name}
        width={300}
        height={400}
        quality={80}
        priority={idx < 3}
        loading={idx < 3 ? "eager" : "lazy"}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="w-full h-full object-cover"
      />
    </div>
  ))}
</div>
```

### User Profile Header
```tsx
<div className="flex gap-4 items-center">
  <Image
    src={user.avatar}
    alt={user.name}
    width={80}
    height={80}
    quality={85}
    priority={true}  // Near top of page
    className="w-20 h-20 rounded-full object-cover"
  />
  <div>
    <h1>{user.name}</h1>
    <p>{user.bio}</p>
  </div>
</div>
```

### Testimonial Card
```tsx
<div className="relative h-64 overflow-hidden rounded-lg">
  <Image
    src={testimonial.image}
    alt={testimonial.author}
    fill
    className="object-cover"
    quality={80}
    priority={false}
    loading="lazy"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</div>
```

### Message Avatar in Chat
```tsx
<div className="flex gap-2">
  <Image
    src={message.avatar}
    alt={message.sender}
    width={40}
    height={40}
    quality={80}
    loading="lazy"
    unoptimized={isExternalUrl}
    className="w-10 h-10 rounded-full object-cover"
  />
  <div>{message.text}</div>
</div>
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Missing Width/Height
```tsx
// BAD: Causes layout shift
<Image src="/photo.jpg" alt="Photo" />

// GOOD: Prevents layout shift
<Image src="/photo.jpg" alt="Photo" width={400} height={300} />
```

### ❌ Wrong Sizes Prop
```tsx
// BAD: Wrong breakpoint, doesn't match actual layout
<Image 
  sizes="(max-width: 800px) 100vw, 50vw"
  // But CSS is: "@media (max-width: 640px) { width: 100% }"
/>

// GOOD: Match CSS breakpoints
<Image 
  sizes="(max-width: 640px) 100vw, 50vw"
  // CSS: "@media (max-width: 640px) { width: 100% }"
/>
```

### ❌ Priority on All Images
```tsx
// BAD: Kills performance
{items.map(item => (
  <Image priority={true} {...props} />
))}

// GOOD: Only first few
{items.map((item, i) => (
  <Image priority={i < 4} {...props} />
))}
```

### ❌ Loading from Dynamic URLs Without Unoptimized
```tsx
// BAD: URL with params changes every request
<Image src={`/api/image?id=${id}&size=large`} {...} />

// GOOD: Set unoptimized for dynamic URLs
<Image 
  src={`/api/image?id=${id}&size=large`} 
  unoptimized={true}
  {...}
/>
```

### ❌ No Alt Text
```tsx
// BAD: Accessibility issue
<Image src="/avatar.jpg" />

// GOOD: Descriptive alt text
<Image src="/avatar.jpg" alt="John Doe's profile picture" />
```

---

## 📊 Bundle Size Impact

### Before (Plain HTML Images)
```html
<img src="/hero.jpg" />
<img src="/card1.jpg" />
<img src="/card2.jpg" />
<!-- All 3 load immediately: ~500KB -->
```

### After (Optimized next/image)
```tsx
<Image src="/hero.jpg" priority={true} quality={90} />
<Image src="/card1.jpg" loading="lazy" quality={80} />
<Image src="/card2.jpg" loading="lazy" quality={80} />
<!-- Hero: 120KB (priority), cards: deferred -->
<!-- Initial load: ~120KB, Rest: 80KB each on scroll -->
```

**Improvement:** ~75% faster initial load (120KB vs 500KB).

---

## ✅ Audit Checklist for Existing Images

Run through this for each image in the app:

- [ ] Is it using `<Image>` from `next/image`?
- [ ] Does it have `width` and `height` props?
- [ ] Does it have a `sizes` prop (if responsive)?
- [ ] Is quality optimized for use case (75-90)?
- [ ] Is `priority` only on above-fold images?
- [ ] Is `loading="lazy"` for below-fold images?
- [ ] Does it have descriptive `alt` text?
- [ ] Is it responsive (scales with viewport)?
- [ ] Does it have proper aspect ratio (no squishing)?
- [ ] Is it using `unoptimized` for dynamic URLs?

---

## 🔗 Related Documentation

- [Image Optimization Complete](./MOBILE_IMAGE_OPTIMIZATION_COMPLETE.md)
- [Component Examples](./MOBILE_COMPONENT_EXAMPLES.md)
- [Mobile Code Patterns](./MOBILE_CODE_PATTERNS.md)

---

**All images in AmoraVibe should follow these patterns.** Audit regularly and update legacy images.
