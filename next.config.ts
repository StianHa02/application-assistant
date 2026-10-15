import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: {
      // CV uploads go through Server Actions; allow up to the 5 MB limit plus form overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
