import { ModeToggle } from "@/components/DarkModeToggler";
import React, { Suspense } from "react";
import ThemeChanger from "@/components/theme-color-toggler";
import SearchForm from "./SearchForm";
import SearchResults from "@/components/SearchResults";
import RealtimeDownloads from "@/components/RealtimeDownloads";
import type { Metadata } from "next";
import SongCardListSkeleton from "./loaders/loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";
import SEOContent from "@/components/SEOContent";

// Route segment config for performance
export const revalidate = 3600; // Revalidate every hour
export const fetchCache = 'default-cache';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const query = (await searchParams).q;

  if (query) {
    return {
      title: `Download "${query}" MP3 Songs Free - 320kbps High Quality | AudioVibes`,
      description: `Download "${query}" in premium 320kbps quality for free. Find and download your favorite songs from JioSaavn with AudioVibes. Fast downloads, high-quality audio, no registration required.`,
      keywords: [
        `${query} download`,
        `${query} mp3 download`,
        `${query} 320kbps`,
        `${query} free download`,
        `download ${query} online`,
        "free music downloader",
        "320kbps mp3 download",
        "jiosaavn downloader",
      ],
      openGraph: {
        title: `Download "${query}" - Free 320kbps MP3 | AudioVibes`,
        description: `Get "${query}" in high-quality 320kbps for free. Premium music downloads with AudioVibes.`,
        url: `https://audiovibes.vercel.app?q=${encodeURIComponent(query)}`,
        type: "website",
        images: [
          {
            url: "https://audiovibes.vercel.app/og-image.jpeg",
            width: 1200,
            height: 630,
            alt: `Download ${query} - AudioVibes`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Download "${query}" MP3 - AudioVibes`,
        description: `Find and download "${query}" in 320kbps quality for free.`,
      },
      alternates: {
        canonical: `https://audiovibes.vercel.app?q=${encodeURIComponent(query)}`,
      },
      robots: {
        index: false,
        follow: true,
        noarchive: true,
      },
    };
  }

  return {
    title: "AudioVibes - Download Free 320kbps MP3 Songs Online | Best Music Downloader 2024",
    description: "Download high-quality 320kbps MP3 songs absolutely free with AudioVibes. Stream and download millions of songs from JioSaavn instantly. Fast, easy, no ads, no registration. Your ultimate music companion for Bollywood, Punjabi, and international hits.",
    keywords: [
      "audiovibes",
      "Ashok Atragadda",
      "free music downloader",
      "download mp3 320kbps",
      "online music downloader",
      "jiosaavn downloader",
      "download songs free",
      "mp3 download online",
      "high quality music download",
      "bollywood songs download",
      "punjabi songs download",
      "free song downloader",
    ],
    alternates: {
      canonical: "https://audiovibes.vercel.app",
    },
    openGraph: {
      title: "AudioVibes - Download Free 320kbps MP3 Songs",
      description: "Stream and download millions of high-quality MP3 songs for free. No ads, no registration required.",
      url: "https://audiovibes.vercel.app",
      type: "website",
      images: [
        {
          url: "https://audiovibes.vercel.app/og-image.jpeg",
          width: 1200,
          height: 630,
          alt: "AudioVibes Music Downloader",
        },
      ],
    },
  };
}

const HomePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const query = (await searchParams).q;

  return (
    <div className="w-full h-dvh flex bg-secondary/40 items-center justify-center overflow-hidden">
      <main className="p-4 flex flex-col bg-background shadow-md max-w-6xl w-full max-sm:h-full max-sm:w-full h-[93%] rounded-lg overflow-hidden" style={{ contain: 'layout style paint' }}>
        <header className="flex items-center justify-between pb-4 shrink-0" style={{ contain: 'layout' }}>
          <div className="text-xs text-nowrap">
            <h1 className="font-bold text-primary rounded-md text-xl inline">
              AudioVibes
            </h1>{" "}
            <span>by Cygnuxxs</span>
          </div>
          <div className="flex space-x-2">
            <RealtimeDownloads />
            <ThemeChanger />
            <ModeToggle />
          </div>
        </header>
        <div className="shrink-0" style={{ contain: 'layout' }}>
          <Suspense fallback={
            <div className="flex items-center gap-2">
              <Input placeholder="Enter your Favourite Music" disabled />
              <Button type="submit" size={"sm"} disabled>
                Find <Music2 className="ml-2" />
              </Button>
            </div>
          }>
            <SearchForm />
          </Suspense>
        </div>
        <section className="overflow-auto items-start justify-center flex-1 w-full gap-2 flex flex-wrap mt-4 min-h-0" aria-label="Search results" style={{ contain: 'layout' }}>
          <Suspense key={query || 'default'} fallback={<SongCardListSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        </section>

        <div className="sr-only">
          <SEOContent />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
