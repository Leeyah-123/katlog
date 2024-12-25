import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['https://katlog.vercel.app'],
    },
  },
};

export default nextConfig;
