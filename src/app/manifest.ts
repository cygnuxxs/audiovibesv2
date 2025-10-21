import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AudioVibes - Free High-Quality Music Downloader | 320kbps MP3",
    short_name: "AudioVibes",
    description:
      "Download premium 320kbps MP3 songs from JioSaavn for free. Fast, high-quality music downloads for music enthusiasts. Built by Cygnuxxs.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    launch_handler: {
      client_mode: ["navigate-existing", "auto"]
    },
    theme_color: "#000000",
    background_color: "#000000",
    orientation: "portrait",
    categories: ["entertainment", "music", "multimedia"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
    ],
    screenshots: [
      {
        src: "/images/ss1.png",
        sizes: "2560x1424",
        type: "image/png",
        form_factor : "wide",
        label: "AudioVibes v2 Home Screen",
      },
      {
        src: "/images/mss1.png",
        sizes: "796x1424",
        form_factor : "narrow",
        type: "image/png",
        label: "AudioVibes Mobile Home Screen",
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
      },
    ],
  };
}
