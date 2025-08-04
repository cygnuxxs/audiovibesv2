import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AudioVibes v2 By Cygnuxxs",
    short_name: "AudioVibes",
    description:
      "Discover, fetch, and download high-quality songs from JioSaavn at 320kbps. Owned and developed by Cygnuxxs for music enthusiasts.",
    start_url: "/",
    display: "standalone",
    theme_color: "#1a1a1a",
    background_color: "#ffffff",
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
        sizes : '2560x1424',
        type: "image/png",
        label: "AudioVibes v2 Home Screen",
      },
      {
        src: "/images/ss2.png",
        sizes : '2560x1424',
        type: "image/png",
        label: "AudioVibes v2 Loading Screen",
      },
      {
        src: "/images/ss3.png",
        sizes : '2560x1424',
        type: "image/png",
        label: "AudioVibes v2 Player Screen",
      },
    ],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon",
      },
    ],
  };
}
