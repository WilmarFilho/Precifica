import type { NextConfig } from "next";

const nextConfig = {
    output: 'standalone',
    experimental: {
      serverComponentsExternalPackages: ['playwright', 'playwright-core'],
    },
  }

export default nextConfig;
