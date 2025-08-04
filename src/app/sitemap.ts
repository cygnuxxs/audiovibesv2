import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://audiovibes.vercel.app", // Replace with your actual domain
      lastModified: new Date(),
      priority: 1.0,
    },
  ];
}