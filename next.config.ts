import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Gives `next dev` access to Cloudflare bindings (a local D1 database, etc.)
if (process.env.NODE_ENV === "development") {
  setupDevPlatform().catch((err) => console.error("setupDevPlatform failed", err));
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
