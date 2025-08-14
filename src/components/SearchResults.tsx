"use client";
import React, { useEffect, useState, useTransition } from "react";
import SongCard from "./SongCard";
import { searchSongs } from "@/lib/actions";
import MusicSpectrumLoader from "@/app/loaders/Spinner";

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
