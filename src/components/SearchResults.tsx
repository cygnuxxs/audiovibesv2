'use client'
import React, { useEffect, useState } from "react";
import SongCard from "./SongCard";
import { useSearchParams } from "next/navigation";
import { searchSongs } from "@/lib/actions";
import MusicSpectrumLoader from "@/app/loaders/Spinner";

export const revalidate = 3600;

const SearchResults = () => {
  const params = useSearchParams();
  const query = params.get("q")?.trim() || "";
  const [data, setData] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await searchSongs(query);
        setData(res);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  if (loading) {
    return <MusicSpectrumLoader size="lg" variant="default" />;
  }

  return (
    <>
      {data.map((song, idx) => (
        <SongCard song={song} key={idx} />
      ))}
    </>
  );
};

export default SearchResults;
