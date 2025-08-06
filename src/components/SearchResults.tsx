import React from "react";
import { searchSongs } from "@/lib/actions";
import SongCard from "./SongCard";

const SearchResults = async ({ query }: { query?: string }) => {
  const data = await searchSongs(query);
  return (
    <>
      {data.map((song, idx) => (
        <SongCard key={idx} song={song} />
      ))}
    </>
  );
};

export default SearchResults;
