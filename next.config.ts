import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/static/view/:path*",
        destination: "http://localhost:8000/static/view/:path*",
      },
    ];
  },
};

export default nextConfig;
