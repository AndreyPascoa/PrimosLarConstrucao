import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.10.10.66"],
  // Admin and database routes require a Node.js server.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
export default nextConfig;
