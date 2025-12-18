import { ThemeProvider } from "@/components/theme-provider";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { ActiveThemeProvider } from "@/components/active-theme";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap", // Use font-display: swap for better performance
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata = {
  metadataBase: new URL("https://audiovibes.vercel.app"),
  title: {
    default: "AudioVibes - Free Music Downloader | Download 320kbps MP3 Songs Online",
    template: "%s | AudioVibes Music Downloader",
  },
  description:
    "Download high-quality 320kbps MP3 songs for free with AudioVibes. Fast, easy, and premium music downloads from JioSaavn. Stream and download millions of songs instantly. No registration required.",
  keywords: [
    "free music downloader",
    "download mp3 songs",
    "320kbps mp3 download",
    "AudioVibes",
    "mp3 downloader online",
    "download music free online",
    "high quality music download",
    "JioSaavn downloader",
    "song downloader free",
    "audio downloader",
    "download songs online",
    "music download app",
    "free mp3 download",
    "download hindi songs",
    "download punjabi songs",
    "bollywood songs download",
    "online music downloader",
    "best music downloader 2024",
    "download songs without ads",
    "offline music downloader",
    "youtube to mp3",
    "saavn songs download",
    "high quality audio download",
    "music downloader app",
    "Cygnuxxs"
  ],
  authors: [
    {
      name: "Ashok Atragadda (Cygnuxxs)",
      url: "https://linkedin.com/in/ashok-atragadda",
    },
  ],
  creator: "Ashok Atragadda (Cygnuxxs)",
  publisher: "Ashok Atragadda (Cygnuxxs)",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://audiovibes.vercel.app",
    languages: {
      'en-US': 'https://audiovibes.vercel.app',
    },
  },
  openGraph: {
    title: "AudioVibes - Download Free 320kbps MP3 Songs | Best Music Downloader",
    description:
      "Download premium 320kbps MP3 songs from JioSaavn absolutely free. Stream millions of songs and download high-quality audio instantly. No ads, no registration. Your ultimate music companion.",
    url: "https://audiovibes.vercel.app",
    siteName: "AudioVibes Music Downloader",
    images: [
      {
        url: "https://audiovibes.vercel.app/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "AudioVibes - Free Music Downloader for 320kbps MP3 Songs",
        type: "image/jpeg",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AudioVibes - Download Free 320kbps MP3 Songs Online",
    description: "Download high-quality 320kbps MP3 songs from JioSaavn for free. Fast downloads, premium audio quality, no ads.",
    images: ["https://audiovibes.vercel.app/og-image.jpeg"],
    creator: "@cygnuxxs",
    site: "@cygnuxxs",
  },
  verification: {
    google: "google-site-verification-code", // User should add their actual code
  },
  category: "music",
  applicationName: "AudioVibes Music Downloader",
  appleWebApp: {
    capable: true,
    title: "AudioVibes",
    statusBarStyle: "black-translucent",
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
  category: "Music & Entertainment",
  classification: "Music Downloader",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://audiovibes.vercel.app" />
        <meta name="application-name" content="AudioVibes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AudioVibes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://www.jiosaavn.com" />
        <link rel="dns-prefetch" href="https://www.jiosaavn.com" />
        {/* Initialize theme before hydration to prevent layout shift */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('app-theme') || 'default';
                  document.documentElement.classList.add('theme-' + theme);
                  if (theme.endsWith('-scaled')) {
                    document.documentElement.classList.add('theme-scaled');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Enhanced JSON-LD Structured Data for Better SEO */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AudioVibes",
              url: "https://audiovibes.vercel.app",
              logo: "https://audiovibes.vercel.app/logo.png",
              description: "Premium music downloader platform offering high-quality 320kbps MP3 downloads from JioSaavn",
              foundingDate: "2024",
              founder: {
                "@type": "Person",
                name: "Ashok Atragadda",
                alternateName: "Cygnuxxs",
                url: "https://linkedin.com/in/ashok-atragadda",
              },
              sameAs: [
                "https://linkedin.com/in/ashok-atragadda",
                "https://github.com/cygnuxxs",
              ],
            }),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AudioVibes",
              url: "https://audiovibes.vercel.app",
              description: "Download high-quality 320kbps MP3 songs from JioSaavn for free",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://audiovibes.vercel.app/?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              publisher: {
                "@type": "Organization",
                name: "AudioVibes",
                logo: {
                  "@type": "ImageObject",
                  url: "https://audiovibes.vercel.app/logo.png"
                }
              }
            }),
          }}
        />
        <Script
          id="webapp-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "AudioVibes",
              url: "https://audiovibes.vercel.app",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
              },
              description: "Free online music downloader for high-quality 320kbps MP3 songs from JioSaavn",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              softwareVersion: "2.0",
              author: {
                "@type": "Person",
                name: "Ashok Atragadda"
              }
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
          strategy="lazyOnload"
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
