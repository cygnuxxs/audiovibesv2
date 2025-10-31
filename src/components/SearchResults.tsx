import React from "react";
import SongCard from './SongCard';

export const revalidate = 3600;

const SearchResults = ({ songs }: { songs: Song[] }) => {
  if (!songs || songs.length === 0) {
    return (
      <div className="w-full text-center py-8 text-muted-foreground">
        <p>No songs found. Try searching for something else.</p>
      </div>
    );
  }

  return (
    <>
      {songs.map((song, index) => (
        <SongCard 
          song={song} 
          key={song.id} 
          priority={index < 3} // Prioritize first 3 images (above the fold)
        />
      ))}
    </>
  );
};

export default SearchResults;
