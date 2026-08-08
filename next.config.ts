import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores the stray lockfile in the home dir.
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    // Allow profile media uploads (headshots/resumes) through Server Actions.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
