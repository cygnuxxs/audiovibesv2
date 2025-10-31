import { Clock, Disc, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { formatDuration, formatViews } from "@/lib/utils";
import { decode } from "he";
import PlayCard from "./PlayCard";

const SongCard: React.FC<{ song: Song; priority?: boolean }> = memo(({ song, priority = false }) => {
  // Use low-res image as placeholder, high-res as main src
  const lowResImageUrl = song.image;
  const highResImageUrl = song.image.replace('50x50', '500x500');
  const artistImageUrl = song.primary_artist_image;

  return (
    <div 
      className="flex flex-1 sm:min-w-120 items-center gap-3 p-0"
      style={{ 
        contentVisibility: priority ? 'auto' : 'auto',
        containIntrinsicSize: '200px 250px'
      }}
    >
      <div className="relative w-[200px] h-[200px] max-sm:w-32 max-sm:h-32 flex-shrink-0">
        <Image
          className="object-cover rounded-md"
          src={highResImageUrl}
          fill
          alt={decode(song.title)}
          sizes="(max-width: 640px) 128px, 200px"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          placeholder="blur"
          blurDataURL={lowResImageUrl}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-base text-ellipsis font-bold">{decode(song.title)}</h2>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.6rem] text-muted-foreground bg-muted hover:text-primary font-bold rounded-full w-fit p-1"
          href={song.album_url ?? "#"}
          aria-label={`Album: ${decode(song.album as string)}`}
        >
          From {decode(song.album as string)}
        </Link>
        <Link
          className="flex gap-2 text-xs items-center text-muted-foreground bg-muted w-fit rounded-full hover:text-primary font-bold"
          target="_blank"
          rel="noopener noreferrer"
          href={song.album_url || "#"}
          aria-label={`Artist: ${song.primary_artist_name}`}
        >
          {artistImageUrl && (
            <div className="relative w-[25px] h-[25px] flex-shrink-0">
              <Image
                className="rounded-full"
                src={artistImageUrl ?? "/profile-circle.png"}
                fill
                alt={song.primary_artist_name as string}
                loading="lazy"
                sizes="25px"
              />
            </div>
          )}
          <span className="pr-2">{song.primary_artist_name}</span>
        </Link>
        <div className="flex flex-wrap text-xs font-medium text-muted-foreground gap-2">
          <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <Clock size={14} aria-hidden="true" />
            <span className="sr-only">Duration:</span>
            {formatDuration(parseInt(song.duration, 10))}
          </p>
          {song.play_count && (
            <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
              <Disc size={14} aria-hidden="true" />
              <span className="sr-only">Play count:</span>
              {formatViews(song.play_count as number)}
            </p>
          )}
          <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <History size={14} aria-hidden="true" />
            <span className="sr-only">Year:</span>
            {song.year}
          </p>
        </div>
        <div className="flex gap-2">
          <PlayCard song={song} />
        </div>
      </div>
    </div>
  );
});

SongCard.displayName = "SongCard";

export default SongCard;
