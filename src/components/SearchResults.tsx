import React from "react";
import { searchSongs } from "@/lib/actions";
import SongCard from "./SongCard";

const SearchResults = async () => {
  const data = await searchSongs();
  return (
    <>
      {data.map((song, idx) => (
        <SongCard key={idx} song={song} />
      ))}
    </>
  );
};

export default SearchResults;
