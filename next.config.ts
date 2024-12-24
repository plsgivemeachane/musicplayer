import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

const nextConfig: NextConfig = withPWA({
  dest:'public',
  register:true ,
  skipWaiting:true,
  reactStrictMode: false,
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],

  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
});

export default nextConfig;
