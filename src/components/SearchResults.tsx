"use client";
import React, { useEffect, useState, useTransition } from "react";
import { searchSongs } from "@/lib/actions";
const MusicSpectrumLoader = dynamic(() => import("@/app/loaders/Spinner"), {ssr : false});
import dynamic from "next/dynamic";
const SongCard = dynamic(() => import('./SongCard'), {ssr : false})

export const revalidate = 3600;

const SearchResults = ({ query }: { query?: string }) => {
  const [data, setData] = useState<Song[]>([]);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await searchSongs(query);
        setData(res);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setData([]);
      }
    });
  }, [query]);

  return isPending ? (
    <MusicSpectrumLoader size="lg" />
  ) : (
    data.map((song) => <SongCard song={song} key={song.id} />)
  );
};

export default SearchResults;
