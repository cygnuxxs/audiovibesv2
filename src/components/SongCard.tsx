import { Clock, Disc, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { formatDuration, formatViews } from "@/lib/utils";
import { decode } from "he";
import PlayCard from "./PlayCard";

const SongCard: React.FC<{
  song: Song;
  priority?: boolean;
  bgColor1: string;
  bgColor2: string;
}> = memo(({ song, priority = false, bgColor1, bgColor2 }) => {
  // Use low-res image as placeholder, high-res as main src
  const lowResImageUrl = song.image;
  const highResImageUrl = song.image.replace("50x50", "500x500");
  const artistImageUrl = song.primary_artist_image;

  return (
    <div
      style={{
        contentVisibility: priority ? "auto" : "auto",
        containIntrinsicSize: "200px 250px",
        // define your gradient color variables
        ["--tone-1" as string]: bgColor1,
        ["--tone-2" as string]: bgColor2,

      }}
      className="group relative flex flex-1 sm:min-w-120 items-center gap-3 p-3 rounded-xl overflow-hidden"
    >
      {/* Gradient overlay that fades in on hover */}
      <div
        style={{
          backgroundImage: `linear-gradient(135deg, ${bgColor1}40 0%, ${bgColor2}40 100%)`,
        }}
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none"
      />
      
      {/* Content wrapper with relative positioning */}
      <div className="relative flex items-center gap-3 w-full">
      <div className="relative w-[200px] h-[200px] max-sm:w-32 max-sm:h-32 shrink-0">
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
        <h2 className="text-base text-ellipsis font-bold">
          {decode(song.title)}
        </h2>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.6rem] text-muted-foreground  hover:text-primary font-bold rounded-full w-fit p-1"
          href={song.album_url ?? "#"}
          aria-label={`Album: ${decode(song.album as string)}`}
        >
          From {decode(song.album as string)}
        </Link>
        <Link
          className="flex gap-2 text-xs items-center text-muted-foreground  w-fit rounded-full hover:text-primary font-bold"
          target="_blank"
          rel="noopener noreferrer"
          href={song.album_url || "#"}
          aria-label={`Artist: ${song.primary_artist_name}`}
        >
          {artistImageUrl && (
            <div className="relative w-[25px] h-[25px] shrink-0">
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
          <p className=" px-1 flex gap-1 items-center rounded-md">
            <Clock size={14} aria-hidden="true" />
            <span className="sr-only">Duration:</span>
            {formatDuration(parseInt(song.duration, 10))}
          </p>
          {song.play_count && (
            <p className=" px-1 flex gap-1 items-center rounded-md">
              <Disc size={14} aria-hidden="true" />
              <span className="sr-only">Play count:</span>
              {formatViews(song.play_count as number)}
            </p>
          )}
          <p className=" px-1 flex gap-1 items-center rounded-md">
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
    </div>
  );
});

SongCard.displayName = "SongCard";

export default SongCard;
