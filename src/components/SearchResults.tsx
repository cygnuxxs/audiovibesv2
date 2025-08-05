'use client'
import React, {useEffect, useState} from "react";
import { searchSongs } from "@/lib/actions";
import SongCard from "./SongCard";
import { useSearchParams } from "next/navigation";

const SearchResults = () => {
  const params = useSearchParams()
  const query = params.get('search')
  const [data, setData] = useState<Song[]>([])
  useEffect(() => {
    const fetchSongs = async () => {
      const result = await searchSongs(query?.toString())
      setData(result)
    }
    fetchSongs()
  }, [query])
  return (
    <>
      {data.map((song, idx) => (
        <SongCard key={idx} song={song} />
      ))}
    </>
  );
};

export default SearchResults;
