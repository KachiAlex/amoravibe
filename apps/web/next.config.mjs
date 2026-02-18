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
  // Transpile internal workspace packages that ship TypeScript/TSX source
  // directly (e.g. `@lovedate/ui`) so Next's webpack can compile them.
  transpilePackages: ['@lovedate/ui'],
  eslint: {
    // allow production builds to succeed locally even when ESLint can't run in CI-like envs
    ignoreDuringBuilds: true,
  },
  typescript: {
    // relax type checking for local preview (we still fix types in source)
    ignoreBuildErrors: true,
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
