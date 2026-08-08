import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores the stray lockfile in the home dir.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
