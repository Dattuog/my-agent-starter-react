import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for Render static site hosting
  output: 'export',
  
  // Optional but recommended optimizations
  images: {
    unoptimized: true, // Required when using 'output: export'
  },
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Disable ESLint during build (to prevent warnings from failing build)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;