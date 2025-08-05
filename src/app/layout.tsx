import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ThemeDataProvider from "@/components/hooks/theme-color-provider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: {
    default: "AudioVibes v2 By Cygnuxxs",
    template: "%s | AudioVibes v2",
  },
  description:
    "Discover, fetch, and download high-quality songs from JioSaavn at 320kbps. Owned and developed by Cygnuxxs for music enthusiasts.",
  keywords: [
    "AudioVibes v2",
    "mp3 downloader",
    "JioSaavn downloader",
    "JioSaavn",
    "song download",
    "320kbps music",
    "fetch songs",
    "music app",
    "AudioVibes",
  ],
  authors: [{ name: "Cygnuxxs" }],
  creator: "Cygnuxxs",
  publisher : 'Ashok Atragadda (Cygnuxxs)',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "AudioVibes v2 - High-Quality Song Downloads from JioSaavn",
    description:
      "Fetch and download your favorite songs from JioSaavn in 320kbps quality. Built for seamless music experiences.",
    url: "https://audiovibes.vercel.app", // Replace with your actual domain
    siteName: "AudioVibes v2",
    images: [
      {
        url: "https://audiovibes.vercel.app/og-image.jpeg", // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: "AudioVibes v2 Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AudioVibes v2 - Download Songs from JioSaavn",
    description: "Get 320kbps song downloads from JioSaavn with AudioVibes v2.",
    images: ["https://audiovibes.vercel.app/og-image.jpeg"], // Replace with your actual Twitter image URL
  },
  // Add icons for better SEO and PWA support
  icons: {
    icon: "/favicon.ico",
    shortcut: "/web-app-manifest-192x192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp : {
    capable : true,
    statusBarStyle : 'default',
    title : 'AudioVibes'
  },
  verification: {
    google: "5t4zBjhovVUsu3rVsR2HSiuUOu6yqVbHSusUkSFdnjY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeDataProvider>
            {children}
            <Toaster />
          </ThemeDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
