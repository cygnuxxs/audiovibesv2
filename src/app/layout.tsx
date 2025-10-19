import { ThemeProvider } from "@/components/theme-provider";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { ActiveThemeProvider } from "@/components/active-theme";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata = {
  metadataBase: new URL("https://audiovibes.vercel.app"),
  title: {
    default: "Audiovibes",
    template: "%s | Audiovibes",
  },
  description:
    "Discover, fetch, and download high-quality songs from JioSaavn at 320kbps. Owned and developed by Cygnuxxs for music enthusiasts.",
  keywords: [
    "Audiovibes",
    "Cygnuxxs",
    "music downloader",
    "download mp3",
    "i love music",
    "320kbps",
    "music downloader",
  ],
  authors: [
    {
      name: "Ashok Atragadda (Cygnuxxs)",
      url: "https://linkedin.com/in/ashok-atragadda",
    },
  ],
  creator: "Ashok Atragadda (Cygnuxxs)",
  publisher: "Ashok Atragadda (Cygnuxxs)",
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
  alternates: {
    canonical: "https://audiovibes.vercel.app",
  },
  openGraph: {
    title: "AudioVibes v2 - High-Quality Song Downloads from JioSaavn",
    description:
      "Fetch and download your favorite songs from JioSaavn in 320kbps quality. Built for seamless music experiences.",
    url: "https://audiovibes.vercel.app",
    siteName: "AudioVibes v2",
    images: [
      {
        url: "https://audiovibes.vercel.app/og-image.jpeg",
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
    images: ["https://audiovibes.vercel.app/og-image.jpeg"],
    creator: "@cygnuxxs", // optional if you have a Twitter handle
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/web-app-manifest-192x192.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "5t4zBjhovVUsu3rVsR2HSiuUOu6yqVbHSusUkSFdnjY",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="AudioVibes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AudioVibes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* JSON-LD Structured Data for Google Logo & Org */}
        <Script id="audiovibes-script"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Audiovibes",
              url: "https://audiovibes.vercel.app",
              logo: "https://audiovibes.vercel.app/logo.png", // make sure logo.png exists in /public
              sameAs: [
                "https://linkedin.com/in/ashok-atragadda",
                "https://github.com/cygnuxxs",
              ],
            }),
          }}
        />
      </head>
      <body className={`${montserrat.className} theme-container antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ActiveThemeProvider>
            {children}
            <Toaster />
            </ActiveThemeProvider>
        </ThemeProvider>

        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful');
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />

        {/* Google AdSense */}
        {/* <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7000544332667041"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        /> */}
      </body>
    </html>
  );
}
