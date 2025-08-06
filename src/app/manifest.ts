import type { MetadataRoute } from "next";

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AudioVibes v2 By Cygnuxxs",
    short_name: "AudioVibes",
    description:
      "Discover, fetch, and download high-quality songs from JioSaavn at 320kbps. Owned and developed by Cygnuxxs for music enthusiasts.",
    start_url: "/",
    id: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    theme_color: "#ffffff",
    background_color: "#000000",
    orientation: "portrait",
    scope: "/",
    prefer_related_applications: false,
    categories: ["entertainment", "music"],
    screenshots: [
      {
        src: "/images/ss1.png",
        sizes: "2560x1424",
        type: "image/png",
        label: "AudioVibes v2 Home Screen",
        form_factor: "wide",
      },
      {
        src: "/images/mss1.png",
        sizes: "796x1424",
        type: "image/png",
        label: "Audiovibes mobile home screen",
      },
      {
        src: "/images/ss2.png",
        sizes: "2560x1424",
        type: "image/png",
        label: "AudioVibes v2 Loading Screen",
        form_factor: "wide",
      },
      {
        src: "/images/ss3.png",
        sizes: "2560x1424",
        type: "image/png",
        label: "AudioVibes v2 Player Screen",
        form_factor: "wide",
      },
    ],
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
