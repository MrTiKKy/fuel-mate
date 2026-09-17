import type { NextConfig } from "next";

// PWA temporarily disabled — @ducanh2912/next-pwa was hanging next config load
// (Node 24). Re-enable once on Node 20 LTS if needed.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
