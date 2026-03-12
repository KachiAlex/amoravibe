/**
 * Mobile-first image optimization utilities for next/image
 */

export interface ResponsiveImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

/**
 * Generate responsive sizes string for next/image
 * Optimizes for mobile-first delivery
 */
export function getResponsiveSizes(
  mobileWidth: number,
  tabletWidth?: number,
  desktopWidth?: number
): string {
  const sizes = [];
  
  // Mobile (up to 640px): full viewport width
  sizes.push('(max-width: 640px) 100vw');
  
  // Tablet (641px to 1024px): 80vw for padding/margins
  if (tabletWidth) {
    sizes.push(`(max-width: 1024px) ${Math.min(tabletWidth, 100)}vw`);
  } else {
    sizes.push('(max-width: 1024px) 80vw');
  }
  
  // Desktop (1025px+): fixed or percentage width
  if (desktopWidth) {
    sizes.push(`${desktopWidth}px`);
  } else {
    sizes.push('(max-width: 1536px) 50vw');
    sizes.push('33vw');
  }
  
  return sizes.join(', ');
}

/**
 * Recommended image configs for common patterns
 */
export const ImageConfigs = {
  // Hero/banner image (full-width)
  hero: (src: string, alt: string): ResponsiveImageConfig => ({
    src,
    alt,
    priority: true,
    quality: 85,
    sizes: '100vw',
  }),

  // Profile/thumbnail (small, square)
  thumbnail: (src: string, alt: string): ResponsiveImageConfig => ({
    src,
    alt,
    quality: 90,
    sizes: getResponsiveSizes(80, 120, 150),
  }),

  // Card image (fixed aspect ratio)
  card: (src: string, alt: string): ResponsiveImageConfig => ({
    src,
    alt,
    quality: 80,
    sizes: getResponsiveSizes(100, 300, 400),
  }),

  // Background image placeholder
  background: (src: string, alt: string): ResponsiveImageConfig => ({
    src,
    alt,
    priority: false,
    quality: 70,
    sizes: '100vw',
  }),
};

/**
 * Common aspect ratios for image optimization
 */
export const AspectRatios = {
  square: 1,
  portrait: 3 / 4,
  landscape: 16 / 9,
  widescreen: 21 / 9,
  golden: 1.618,
};

/**
 * Generate srcSet for art direction (multiple aspect ratios)
 * Falls back to alt images on different screen sizes
 */
export function getArtDirectionSrcSet(
  mobileSrc: string,
  tabletSrc?: string,
  desktopSrc?: string
): { mobileElem: string; tabletElem: string; desktopElem: string } {
  return {
    mobileElem: mobileSrc,
    tabletElem: tabletSrc || mobileSrc,
    desktopElem: desktopSrc || tabletSrc || mobileSrc,
  };
}
