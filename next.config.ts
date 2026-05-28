import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/static/view/:path*",
        destination: `${apiBaseUrl}/static/view/:path*`,
      },
    ];
  },
};

export default nextConfig;
