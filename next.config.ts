import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [320, 480],
  },
};

export default nextConfig;
