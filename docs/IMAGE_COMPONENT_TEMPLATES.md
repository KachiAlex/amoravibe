# Image Component Copy-Paste Templates

Ready-to-use image component patterns for common layouts.

---

## Template 1: Hero Banner (Above-Fold)

**Use for:** Landing page hero, profile header, featured sections

```tsx
import Image from "next/image";

export function HeroBanner() {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
      <Image
        src="/images/hero-banner.jpg"
        alt="Welcome to AmoraVibe - Find Your Perfect Match"
        fill
        className="object-cover"
        priority={true}
        quality={90}
        loading="eager"
      />
    </div>
  );
}
```

**Metrics:**
- Typical size: 500KB → 200KB (with quality=90)
- Load time: Immediate (priority=true)
- Impact: No LCP delay

---

## Template 2: Card Grid (4-Column with Smart Loading)

**Use for:** Match profiles, search results, recommendations

```tsx
import Image from "next/image";

export function CardGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <div key={item.id} className="rounded-lg overflow-hidden shadow-md">
          <div className="relative w-full aspect-[3/4]">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              quality={80}
              priority={index < 4}  // First 4 items (visible on desktop)
              loading={index < 4 ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.age}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Metrics:**
- First 4 items: ~80KB each (eager)
- Remaining items: ~60KB each (lazy)
- Initial load: ~320KB, then 60KB per scroll batch

---

## Template 3: Avatar with Fallback

**Use for:** User profiles, comments, chat messages

```tsx
import Image from "next/image";

export function Avatar({ 
  src, 
  alt, 
  size = "md",
  priority = false 
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
      <Image
        src={src || "/images/default-avatar.png"}
        alt={alt}
        width={64}
        height={64}
        className="w-full h-full object-cover"
        quality={85}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        unoptimized={src?.includes("http")}  // External URLs
      />
    </div>
  );
}

// Usage:
// <Avatar src="https://example.com/avatar.jpg" alt="John Doe" size="lg" priority={true} />
```

**Metrics:**
- Avatar size: 5-10KB (quality=85)
- Load time: Deferred for non-priority
- Impact: Minimal LCP impact

---

## Template 4: List Item with Image

**Use for:** Messages, chat history, match list

```tsx
import Image from "next/image";

export function ListItem({ item, index }) {
  return (
    <div className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg">
      <Image
        src={item.avatar}
        alt={item.name}
        width={48}
        height={48}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        quality={80}
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.name}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{item.message}</p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
    </div>
  );
}
```

**Metrics:**
- Avatar: 8KB per item
- Lazy-loads on scroll
- No LCP impact

---

## Template 5: 3-Column Testimonials

**Use for:** Success stories, testimonials, reviews

```tsx
import Image from "next/image";

export function TestimonialGrid({ testimonials }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((item, index) => (
        <div key={item.id} className="rounded-lg overflow-hidden shadow-sm bg-white">
          <div className="relative w-full h-48">
            <Image
              src={item.image}
              alt={item.author}
              fill
              className="object-cover"
              quality={80}
              priority={index < 3}  // First 3 visible
              loading={index < 3 ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          <div className="p-4">
            <p className="text-gray-700 mb-3">"{item.quote}"</p>
            <p className="font-semibold text-sm">{item.author}</p>
            <p className="text-xs text-gray-500">{item.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Metrics:**
- First 3 items: ~70KB each (eager)
- Remaining: ~50KB each (lazy)
- Initial: ~210KB, then 50KB batches

---

## Template 6: Profile Header with Cover Image

**Use for:** User profiles, business pages

```tsx
import Image from "next/image";
import { Avatar } from "./Avatar";

export function ProfileHeader({ user }) {
  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 rounded-lg overflow-hidden">
        <Image
          src={user.coverImage}
          alt={`${user.name}'s cover`}
          fill
          className="object-cover"
          quality={80}
          priority={true}  // Above fold
          loading="eager"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
        />
      </div>

      {/* Profile Details */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="flex gap-4 items-end">
          <div className="relative -mt-12 w-24 h-24 bg-white rounded-lg border-4 border-white overflow-hidden">
            <Avatar
              src={user.avatar}
              alt={user.name}
              size="xl"
              priority={true}  // Same as cover
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Metrics:**
- Cover: 150KB (quality=80)
- Avatar: 8KB (quality=85)
- Total: ~160KB, all priority (above fold)

---

## Template 7: Lazy-Load Image Gallery

**Use for:** Photos, portfolio, galleries

```tsx
import Image from "next/image";
import { useState } from "react";

export function ImageGallery({ images }) {
  const [loaded, setLoaded] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoaded((prev) => new Set(prev).add(id));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative w-full aspect-square bg-gray-200 rounded overflow-hidden"
        >
          <Image
            src={image.url}
            alt={image.alt || "Gallery image"}
            fill
            className="object-cover"
            quality={75}  // Lower for thumbnails
            loading="lazy"
            onLoadingComplete={() => handleImageLoad(image.id)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {!loaded.has(image.id) && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}
```

**Metrics:**
- Thumbnail: 30KB each (quality=75)
- All lazy-loaded
- Skeleton on load

---

## Template 8: Dynamic External Image

**Use for:** Third-party avatars, CDN images with params

```tsx
import Image from "next/image";

export function ExternalImage({ src, alt, size = "medium" }) {
  const sizes = {
    small: { width: 100, height: 100 },
    medium: { width: 200, height: 200 },
    large: { width: 400, height: 400 },
  };

  const { width, height } = sizes[size];

  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        quality={85}
        loading="lazy"
        unoptimized={true}  // IMPORTANT: External URL with params
        sizes={`${width}px`}
      />
    </div>
  );
}

// Usage:
// <ExternalImage 
//   src="https://api.example.com/avatar?id=123&size=large" 
//   alt="User avatar" 
//   size="large"
// />
```

**Metrics:**
- Varies by source
- `unoptimized={true}` required for dynamic URLs
- No local optimization applied

---

## Template 9: With Blur Placeholder

**Use for:** Premium performance with visual polish

```tsx
import Image from "next/image";
import { getPlaiceholder } from "plaiceholder";

// Use in getStaticProps or getServerSideProps:
export async function getStaticProps() {
  const { base64, img } = await getPlaiceholder("/images/profile.jpg");

  return {
    props: {
      blurDataURL: base64,
      src: img.src,
    },
  };
}

export function BlurImage({ src, blurDataURL, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL={blurDataURL}
      quality={80}
      loading="lazy"
    />
  );
}
```

**Metrics:**
- Adds <1KB to bundle (blurred placeholder)
- Improves perceived performance
- Data URL embedded in HTML

---

## Template 10: Responsive Picture Element

**Use for:** Multiple formats (WebP, fallback)

```tsx
import Image from "next/image";

export function ResponsivePicture({ imageSet, alt }) {
  return (
    <picture>
      {/* WebP for modern browsers */}
      <source
        srcSet={imageSet.webp}
        type="image/webp"
        media="(min-width: 640px)"
      />
      {/* JPEG fallback */}
      <source
        srcSet={imageSet.jpeg}
        type="image/jpeg"
        media="(min-width: 640px)"
      />
      {/* Mobile */}
      <source
        srcSet={imageSet.mobileSrc}
        media="(max-width: 640px)"
      />
      {/* Fallback */}
      <img
        src={imageSet.jpeg}
        alt={alt}
        className="w-full h-auto"
      />
    </picture>
  );
}

// Note: next/image handles format selection automatically
// Only use <picture> if you need advanced control
```

---

## Template 11: Image with Context Menu

**Use for:** Profile cards, match profiles with actions

```tsx
import Image from "next/image";
import { useState } from "react";

export function ProfileImage({ profile, onAction }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative group">
      <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
        <Image
          src={profile.image}
          alt={profile.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          quality={85}
          loading="lazy"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            className="bg-white text-black px-4 py-2 rounded-full font-semibold"
            onClick={() => onAction("like")}
          >
            Like
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Quick Sizes Reference

Copy-paste for different grid layouts:

```tsx
// Single column
sizes="(max-width: 640px) 100vw, 100vw"

// 2-Column
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"

// 3-Column (Match grid)
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"

// 4-Column (Profile grid)
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"

// Hero Variable
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"

// Avatar/Square
sizes="(max-width: 640px) 64px, 80px"
```

---

## Quality Presets

```tsx
// Light images (JPEGs, photos)
quality={80}

// Avatars, important
quality={85}

// Hero, featured
quality={90}

// Thumbnails
quality={75}

// PNG with transparency (should be WebP/AVIF anyway)
quality={90}
```

---

Keep these templates handy and adapt them to your needs!
