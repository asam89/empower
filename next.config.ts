import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// `npm run dev:d1` gives `next dev` a local D1 database (needed for /portal).
// Plain `npm run dev` keeps running without one, using demo data where available.
if (process.env.NODE_ENV === "development" && process.env.USE_LOCAL_D1 === "1") {
  setupDevPlatform().catch((err) => console.error("setupDevPlatform failed", err));
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
