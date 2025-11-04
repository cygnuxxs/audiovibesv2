import React from "react";
import SongCard from './SongCard';
import { getAverageColor } from "@/lib/fetch-colors";

export const revalidate = 3600;

const SearchResults = async ({ songs }: { songs: Song[] }) => {
  if (!songs || songs.length === 0) {
    return (
      <div className="w-full text-center py-8 text-muted-foreground">
        <p>No songs found. Try searching for something else.</p>
      </div>
    );
  }

  const colors = await Promise.all(
    songs.map(song => getAverageColor(song.image))
  );

  return (
    <>
      {songs.map((song, index) => (
        <SongCard 
          song={song} 
          key={song.id} 
          bgColor1={colors[index].color1}
          bgColor2={colors[index].color2}
          priority={index < 3} // Prioritize first 3 images (above the fold)
        />
      ))}
    </>
  );
};

export default SearchResults;
