'use client';

import { useEffect } from 'react';

/**
 * Resource Hints Injector
 * Adds preconnect, dns-prefetch, and preload directives for external resources
 * to reduce connection time for critical third-party origins
 */
export function ResourceHintsInjector() {
  useEffect(() => {
    // Add resource hints to document head
    const hints = [
      // Preconnect to external image CDNs
      { rel: 'preconnect', href: 'https://images.unsplash.com', crossorigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://plus.unsplash.com', crossorigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://randomuser.me', crossorigin: 'anonymous' },
      
      // DNS prefetch for analytics (lighter than preconnect)
      { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
      { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
      
      // Preload critical fonts (if using webfonts beyond Google Fonts)
      // Already handled by Next.js Font optimization
    ];

    hints.forEach(({ rel, href, crossorigin }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (crossorigin) {
        link.crossOrigin = crossorigin;
      }
      // Only add if not already present
      if (!document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
        document.head.appendChild(link);
      }
    });
  }, []);

  return null;
}
