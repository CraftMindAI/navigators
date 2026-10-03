import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "etripto.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  basePath: "/navigatores_Tours_Travel",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/navigatores_Tours_Travel",
  },
};

export default nextConfig;
