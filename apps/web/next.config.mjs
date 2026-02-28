import { createRequire } from 'module';

const requireC = createRequire(import.meta.url);

const allowedOrigins = [
  'http://localhost:3000',
  'https://amoravibe.vercel.app',
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
  // Explicitly declare Turbopack config so Next.js 16 treats this file as
  // compatible even though we still customize webpack below.
  turbopack: {},
  // Transpile internal workspace packages that ship TypeScript/TSX source
  // directly (e.g. `@lovedate/ui`) so Next's webpack can compile them.
  transpilePackages: ['@lovedate/ui'],
  typescript: {
    // relax type checking for local preview (we still fix types in source)
    ignoreBuildErrors: true,
  },
  webpack(config, { isServer }) {
    // Exclude @sentry/node from webpack bundles; we'll require it at runtime
    // to avoid pulling in OpenTelemetry dependencies during build.
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@sentry/node');
      }
    }
    return config;
  },
  images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'plus.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
      ],
  },
};

export default nextConfig;
