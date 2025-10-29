import { ModeToggle } from "@/components/DarkModeToggler";
import React from "react";
import ThemeChanger from "@/components/theme-color-toggler";
import SearchForm from "./SearchForm";
import SearchResults from "@/components/SearchResults";
import RealtimeDownloads from "@/components/RealtimeDownloads";
import type { Metadata } from "next";

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
        url: `https://audiovibes.vercel.app/?q=${encodeURIComponent(query)}`,
      },
      twitter: {
        title: `Download "${query}" - AudioVibes`,
        description: `Find and download "${query}" in 320kbps quality.`,
      },
      alternates: {
        canonical: `https://audiovibes.vercel.app/`,
      },
    };
  }

  return {
    title: "AudioVibes - Free High-Quality Music Downloader | 320kbps MP3 Songs",
    description: "Download premium 320kbps MP3 songs from JioSaavn for free. Search and download your favorite music with AudioVibes.",
  };
}

const HomePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const query = (await searchParams).q;

  return (
    <div className="w-screen h-dvh flex bg-secondary/40 items-center justify-center">
      <main className="p-4 flex flex-col bg-background shadow-md max-w-6xl w-full max-sm:h-full max-sm:w-full h-[93%] rounded-lg">
        <header className="flex items-center justify-between pb-4">
          <h1 className="text-xs text-nowrap">
            <span className="font-bold text-primary rounded-md text-xl">
              AudioVibes
            </span>{" "}
            by Cygnuxxs
          </h1>
          <div className="flex gap-2">
          <RealtimeDownloads />
            <ThemeChanger />
            <ModeToggle />
          </div>
        </header>
        <SearchForm />
        <section className="overflow-auto items-start justify-center h-full flex w-full gap-4 flex-wrap mt-4" aria-label="Search results">
          <SearchResults query={query} />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
