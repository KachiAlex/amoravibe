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
};

export default nextConfig;
