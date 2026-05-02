import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash (mock data / seeded images)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "randomuser.me" },
      // Local Laravel backend
      { protocol: "http",  hostname: "localhost", port: "8000" },
      { protocol: "http",  hostname: "127.0.0.1", port: "8000" },
      // Railway deployment (backend)
      { protocol: "https", hostname: "*.railway.app" },
      // Production domain (update when available)
      { protocol: "https", hostname: "*.genaan.com" },
    ],
  },
};

export default nextConfig;

