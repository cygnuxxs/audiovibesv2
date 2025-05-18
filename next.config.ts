import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: { remotePatterns: [{ hostname: "yt3.ggpht.com", protocol : 'https'}, { hostname: "i.ytimg.com", protocol : 'https'}, { hostname: "yt3.ggpht.com", protocol : 'http'}, { hostname: "i.ytimg.com", protocol : 'http'}] },
};

export default nextConfig;
