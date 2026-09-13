import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this project (avoids picking up parent lockfiles)
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      // Leave room above the 1 MB .txt limit for multipart overhead.
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
