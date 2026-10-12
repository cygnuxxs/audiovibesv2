import { use } from 'react';
import SongCard from './SongCard';
import { searchSongs } from "@/lib/actions";
import React from 'react';

export const revalidate = 3600;

const SearchResults = ({ query }: { query?: string }) => {
  const songs = use(searchSongs(query));
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
        <React.Fragment key={song.id}>
          <SongCard
            song={song}
            priority={index < 3} // Prioritize first 3 images (above the fold)
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default SearchResults;
