import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

const nextConfig: NextConfig = withPWA({
  reactStrictMode: false,
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [
      'lh3.googleusercontent.com',
      'via.placeholder.com'
    ]
  },
});

export default nextConfig;
