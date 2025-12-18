import { ModeToggle } from "@/components/DarkModeToggler";
import React, { Suspense } from "react";
import ThemeChanger from "@/components/theme-color-toggler";
import SearchForm from "./SearchForm";
import SearchResults from "@/components/SearchResults";
import RealtimeDownloads from "@/components/RealtimeDownloads";
import type { Metadata, Viewport } from "next"; // Added Viewport
import SongCardListSkeleton from "./loaders/loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";
import SEOContent from "@/components/SEOContent";

// Performance & Caching
// Note: Pages using searchParams are dynamically rendered on request.
// However, fetch requests inside can still be cached.
export const revalidate = 3600;

// Viewport export is now separate from Metadata in Next.js 14+
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

const APP_URL = "https://audiovibes.vercel.app";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const query = (await searchParams).q;

  // 1. DYNAMIC SEARCH RESULTS METADATA
  // Best Practice: Do NOT index internal search results to save crawl budget
  if (query) {
    const decodedQuery = decodeURIComponent(query);
    return {
      title: `Download ${decodedQuery} MP3 - High Quality Free | AudioVibes`,
      description: `Listen and download ${decodedQuery} in 320kbps HD quality. Fast, free, and no registration required.`,
      robots: {
        index: false, // Prevent Google from indexing search result pages (prevents "thin content" penalty)
        follow: true, // Allow Google to follow links to actual songs/artist pages
      },
      alternates: {
        canonical: `${APP_URL}?q=${encodeURIComponent(query)}`,
      },
      openGraph: {
        title: `Download ${decodedQuery} - Free MP3`,
        description: `Get ${decodedQuery} in 320kbps immediately.`,
        url: `${APP_URL}?q=${encodeURIComponent(query)}`,
        images: [{ url: `${APP_URL}/og-image.jpeg`, width: 1200, height: 630 }],
      },
    };
  }

  // 2. HOMEPAGE METADATA (The Main Ranking Page)
  return {
    title: "AudioVibes | Free MP3 Music Downloader & Streaming (320kbps)",
    description: "The best free music downloader for Bollywood, Punjabi, and English songs. Stream or download 320kbps MP3s from JioSaavn instantly without login.",
    applicationName: "AudioVibes",
    authors: [{ name: "Ashok Atragadda", url: "https://github.com/cygnuxxs" }],
    keywords: [
      "AudioVibes",
      "free mp3 download",
      "320kbps music downloader",
      "jiosaavn downloader",
      "youtube to mp3 high quality",
      "bollywood songs download",
      "no ads music player",
      "web music player"
    ],
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical: APP_URL,
    },
    openGraph: {
      siteName: "AudioVibes",
      title: "AudioVibes - Download & Stream High Quality Music Free",
      description: "Zero ads, Zero cost. Download millions of songs in 320kbps quality immediately.",
      url: APP_URL,
      type: "website",
      images: [
        {
          url: `${APP_URL}/og-image.jpeg`,
          width: 1200,
          height: 630,
          alt: "AudioVibes Interface",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@cygnuxxs", // Add your handle if you have one
    },
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
  };
}

const HomePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const query = (await searchParams).q;

  // SCHEMA MARKUP (JSON-LD)
  // This tells Google exactly what your website IS.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AudioVibes",
    "url": APP_URL,
    "description": "Free high-quality music downloader and streamer.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Ashok Atragadda"
    }
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full h-dvh flex flex-col bg-secondary/40 items-center justify-center overflow-hidden">
        <main
          className="p-4 flex flex-col bg-background shadow-md max-w-6xl w-full max-sm:h-full max-sm:w-full h-[93%] rounded-lg overflow-hidden relative"
          style={{ contain: 'layout style paint' }}
        >
          {/* Header */}
          <header className="flex items-center justify-between pb-4 shrink-0" style={{ contain: 'layout' }}>
            <div className="text-xs text-nowrap flex flex-col justify-center">
              {/* H1 is crucial for SEO. Putting it here. */}
              <h1 className="font-bold text-primary rounded-md text-xl leading-none">
                AudioVibes
              </h1>
              <span className="text-[10px] text-muted-foreground opacity-70">
                by Cygnuxxs
              </span>
            </div>
            <div className="flex space-x-2 items-center">
              <RealtimeDownloads />
              <ThemeChanger />
              <ModeToggle />
            </div>
          </header>

          {/* Search Area */}
          <section className="shrink-0" style={{ contain: 'layout' }}>
            <Suspense fallback={
              <div className="flex items-center gap-2">
                <Input placeholder="Search songs, albums, artists..." disabled className="bg-muted" />
                <Button type="submit" size={"sm"} disabled>
                  Find <Music2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            }>
              <SearchForm />
            </Suspense>
          </section>

          {/* Results Area */}
          <section
            className="overflow-auto items-start justify-center flex-1 w-full gap-2 flex flex-wrap mt-4 min-h-0"
            aria-label={query ? `Search results for ${query}` : "Recommended songs"}
            style={{ contain: 'layout' }}
          >
            <Suspense key={query || 'default'} fallback={<SongCardListSkeleton />}>
              <SearchResults query={query} />
            </Suspense>
          </section>
        </main>
        {!query && (
            <footer className="mt-4 h-12 overflow-auto pt-4 border-t border-border/40">
              <div className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                 <SEOContent />
                 <p className="mt-2">
                   &copy; {new Date().getFullYear()} AudioVibes. Free Music Downloader.
                 </p>
              </div>
            </footer>
          )}
      </div>
    </>
  );
};

export default HomePage;