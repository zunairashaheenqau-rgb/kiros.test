import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize production builds
  compress: true,
  
  // Optimize images (if we add any in the future)
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
