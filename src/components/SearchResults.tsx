import React from "react";
import SongCard from './SongCard';
import { getAverageColor } from "@/lib/fetch-colors";
import { searchSongs } from "@/lib/actions";

export const revalidate = 3600;

const SearchResults = async ({ query }: { query?: string }) => {
  // Add a small delay to ensure Suspense fallback is visible
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Fetch songs inside the component so Suspense can properly suspend
  const songs = await searchSongs(query);
  
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
