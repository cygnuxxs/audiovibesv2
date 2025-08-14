import { ThemeProvider } from "@/components/theme-provider";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import ThemeDataProvider from "@/components/hooks/theme-color-provider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AudioVibes v2 By Cygnuxxs</title>
        <meta name="title" content="AudioVibes v2 By Cygnuxxs" />
        <meta
          name="description"
          content="Discover, fetch, and download high-quality songs from JioSaavn at 320kbps. Owned and developed by Cygnuxxs for music enthusiasts."
        />
        <meta
          name="keywords"
          content="AudioVibes v2, mp3 downloader, JioSaavn downloader, JioSaavn, song download, 320kbps music, fetch songs, music app, AudioVibes"
        />
        <meta name="author" content="Cygnuxxs" />
        <meta name="creator" content="Cygnuxxs" />
        <meta name="publisher" content="Ashok Atragadda (Cygnuxxs)" />
        <meta name="robots" content="index, follow" />
        <meta
          name="googlebot"
          content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
        />
        <meta
          property="og:title"
          content="AudioVibes v2 - High-Quality Song Downloads from JioSaavn"
        />
        <meta
          property="og:description"
          content="Fetch and download your favorite songs from JioSaavn in 320kbps quality. Built for seamless music experiences."
        />
        <meta property="og:url" content="https://audiovibes.vercel.app" />
        <meta property="og:site_name" content="AudioVibes v2" />
        <meta
          property="og:image"
          content="https://audiovibes.vercel.app/og-image.jpeg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="AudioVibes v2 Banner" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="AudioVibes v2 - Download Songs from JioSaavn"
        />
        <meta
          name="twitter:description"
          content="Get 320kbps song downloads from JioSaavn with AudioVibes v2."
        />
        <meta
          name="twitter:image"
          content="https://audiovibes.vercel.app/og-image.jpeg"
        />

        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/web-app-manifest-192x192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AudioVibes" />

        <meta
          name="google-site-verification"
          content="5t4zBjhovVUsu3rVsR2HSiuUOu6yqVbHSusUkSFdnjY"
        />
      </head>
      <body className={`${montserrat.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeDataProvider>
            {children}
            <Toaster />
          </ThemeDataProvider>
        </ThemeProvider>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7000544332667041"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
