import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AudioVibes v2 By Cygnuxxs",
    short_name: "AudioVibes",
    description:
      "Discover, fetch, and download high-quality songs from JioSaavn at 320kbps. Owned and developed by Cygnuxxs for music enthusiasts.",
    start_url: "/",
    display: "standalone",
    theme_color: "#ffffff",
    background_color: "#000000",
    orientation: "landscape",
    related_applications: [
      {
        platform: "web",
        url: "https://prepflow.vercel.app",
      },
    ],
    screenshots: [
      {
        src: "/images/ss1.png",
        sizes: "2560x1424",
        type: "image/png",
        label: "AudioVibes v2 Home Screen",
        form_factor : 'wide'
      },
      {
        src: "/images/ss2.png",
        sizes: "2560x1424",
        type: "image/png",
        label: "AudioVibes v2 Loading Screen",
      },
      {
        src: "/images/ss3.png",
        sizes: "2560x1424",
        type: "image/png",
        label: "AudioVibes v2 Player Screen",
        form_factor : 'wide'
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
        purpose: "maskable",
      },
    ],
  };
}
