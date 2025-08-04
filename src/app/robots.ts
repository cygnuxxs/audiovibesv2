import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Robots {
    return {
        rules: [
        {
            userAgent: "*",
            allow: "/",
        },
        ],
        sitemap: "https://audiovibes.vercel.app/sitemap.xml", // Replace with your actual sitemap URL
        host: "https://audiovibes.vercel.app", // Replace with your actual domain
    };
    }
