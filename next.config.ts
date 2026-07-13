import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/hh/oauth/callback/",
        destination: "/auth/hh/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
