import React from "react";
import SongCard from "./SongCard";
import { Video } from "youtube-sr";
import { searchSongs } from "@/lib/actions";

const SearchResults = async () => {
  const data = await searchSongs()
  return (
    <>
      {data.map((song, idx) => (
        <SongCard key={idx} song={song} />
      ))}
      
    </>
  );
};

export default SearchResults;
