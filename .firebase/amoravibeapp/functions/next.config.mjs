// next.config.mjs
var allowedOrigins = [
  "http://localhost:3000",
  "https://amoravibe.vercel.app",
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean);
var nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins
    }
  },
  // Transpile internal workspace packages that ship TypeScript/TSX source
  // directly (e.g. `@lovedate/ui`) so Next's webpack can compile them.
  transpilePackages: ["@lovedate/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com"
      }
    ]
  }
};
var next_config_default = nextConfig;
export {
  next_config_default as default
};
