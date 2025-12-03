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
      title: `Search Results for "${query}" - Download High-Quality MP3 Songs`,
      description: `Find and download "${query}" in premium 320kbps quality. AudioVibes offers fast, free high-quality music downloads from JioSaavn.`,
      openGraph: {
        title: `Download "${query}" - AudioVibes Music Downloader`,
        description: `Get "${query}" in 320kbps quality for free. Premium music downloads at AudioVibes.`,
        url: `https://audiovibes.vercel.app`,
      },
      twitter: {
        title: `Download "${query}" - AudioVibes`,
        description: `Find and download "${query}" in 320kbps quality.`,
      },
      alternates: {
        canonical: "https://audiovibes.vercel.app",
      },
      robots: {
        index: false,
        follow: true,
        noarchive: true,
      },
    };
  }

  return {
    title: "AudioVibes - Free High-Quality Music Downloader | 320kbps MP3 Songs",
    description: "Download premium 320kbps MP3 songs from JioSaavn for free. Search and download your favorite music with AudioVibes.",
    alternates: {
      canonical: "https://audiovibes.vercel.app",
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
          <h1 className="text-xs text-nowrap">
            <span className="font-bold text-primary rounded-md text-xl">
              AudioVibes
            </span>{" "}
            by Cygnuxxs
          </h1>
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
      </main>
    </div>
  );
};

export default HomePage;
