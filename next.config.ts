import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images : {
    remotePatterns : [
      {
        protocol: "https",
        hostname : "aac.saavncdn.com",
      },{
        protocol: "https",
        hostname : "c.saavncdn.com",
      }
    ]
  }
};

export default nextConfig;
