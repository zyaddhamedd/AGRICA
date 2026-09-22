import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/", destination: "/en/", permanent: true },
      { source: "/products", destination: "/en/products", permanent: true },
      { source: "/standard", destination: "/en/standard", permanent: true },
      { source: "/herbs-spices", destination: "/en/herbs-spices", permanent: true },
      { source: "/herbs-spices/products", destination: "/en/herbs-spices/products", permanent: true },
      { source: "/herbs-spices/standard", destination: "/en/herbs-spices/standard", permanent: true },
    ];
  },
};

export default nextConfig;
