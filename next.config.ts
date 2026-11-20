import path from "node:path";
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
  webpack(config, { nextRuntime, webpack }) {
    // The Anthropic SDK lazily imports node:fs / node:path for file-based
    // credentials. We always pass the API key explicitly, so stub those
    // modules out of the Cloudflare edge bundle.
    if (nextRuntime === "edge") {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:(fs|fs\/promises|path)$/, (resource: { request: string }) => {
          resource.request = path.resolve(process.cwd(), "src/lib/stubs/empty.js");
        })
      );
    }
    return config;
  },
};

export default nextConfig;
