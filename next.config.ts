import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Embedded local previews can use an opaque browser origin.
  // This is limited to the development server and keeps localhost usable.
  allowedDevOrigins: ['null'],
};

export default nextConfig;
