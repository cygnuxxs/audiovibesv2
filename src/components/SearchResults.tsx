"use client";
import React, { useEffect, useState } from "react";
import { searchSongs } from "@/lib/actions";
import SongCard from "./SongCard";
import { useSearchParams } from "next/navigation";
import LoadingText from "@/app/loaders/LoadingText";

const SearchResults = () => {
  const params = useSearchParams();
  const query = params.get("search");
  const [data, setData] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      const result = await searchSongs(query?.toString());
      setData(result);
      setLoading(false);
    };
    fetchSongs();
  }, [query]);
  return (
    <>
      {loading ? (
        <LoadingText />
      ) : (
        data.map((song, idx) => <SongCard key={idx} song={song} />)
      )}
    </>
  );
};

export default SearchResults;
