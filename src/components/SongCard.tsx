import { Clock, Disc, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { formatDuration, formatViews } from "@/lib/utils";
import PlayCard from "./PlayCard";
import { decode } from "he";

const SongCard: React.FC<{ song: Song }> = ({ song }) => {
  const highestImageUrl = song.image[song.image.length - 1]?.url;
  const artistImageUrl =
    song.artists.primary[song.artists.primary.length - 1]?.image.at(-1);

  return (
    <div className="flex flex-1 sm:min-w-[30rem] items-center gap-3 p-0">
        <Image
          className="object-cover rounded-md max-sm:max-w-[8rem] max-sm:h-auto"
          src={highestImageUrl}
          height={200}
          width={200}
          alt={song.name}
          priority
        />
      <div className="space-y-2">
        <h2 className="text-base text-ellipsis font-bold">{decode(song.name)}</h2>
        <Link
          target="_blank"
          className="text-[0.6rem] text-muted-foreground hover:text-primary font-bold rounded-full bg-muted w-fit p-1"
          href={song.album?.url ?? "#"}
        >
          From {decode(song.album?.name as string)}
        </Link>
        <Link
          className="flex gap-2 text-xs items-center text-muted-foreground bg-muted w-fit rounded-full hover:text-primary font-bold"
          target="_blank"
          rel="noopener noreferrer"
          href={song.url || "#"}
        >
          {artistImageUrl?.url && (
            <Image
              className="rounded-full"
              src={artistImageUrl?.url ?? "/profile-circle.png"}
              height={25}
              width={25}
              alt={song.artists?.primary[0]?.name}
            />
          )}
          <span className="pr-2">{song.artists?.primary[0]?.name}</span>
        </Link>
        <div className="flex flex-wrap text-xs font-medium text-muted-foreground gap-2">
          <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <span>
              <Clock size={"14px"} />
            </span>
            {formatDuration(song.duration)}
          </p>
          {song.playCount && (
<p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <span>
              <Disc size={"14px"} />
            </span>
            {formatViews(song.playCount as number)}
          </p>
          )}
          <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <span>
              <History size={"14px"} />
            </span>
            {song.year}
          </p>
        </div>
        <div className="flex gap-2">
          <PlayCard videoTitle={decode(song.name)} id={song.id} album={song.album.name as string} />
        </div>
      </div>
    </div>
  );
};

export default SongCard;
