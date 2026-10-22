import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_OUTPUT_STANDALONE === "1" ? { output: "standalone" } : {}),
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
