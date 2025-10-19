import { Clock, Disc, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { formatDuration, formatViews } from "@/lib/utils";
import dynamic from "next/dynamic";
import { decode } from "he";

const PlayCard = dynamic(() => import("./PlayCard"), {ssr : false});

const SongCard: React.FC<{ song: Song }> = ({ song }) => {
  const highestImageUrl = song.image;
  const artistImageUrl = song.primary_artist_image;

  return (
    <div className="flex flex-1 sm:min-w-120 items-center gap-3 p-0">
        <Image
          className="object-cover rounded-md max-sm:max-w-32 max-sm:h-auto"
          src={highestImageUrl}
          height={200}
          width={200}
          alt={song.title}
          loading="eager"
          priority
        />
      <div className="flex flex-col gap-2">
        <h2 className="text-base text-ellipsis font-bold">{decode(song.title)}</h2>
        <Link
          target="_blank"
          className="text-[0.6rem] text-muted-foreground bg-muted hover:text-primary font-bold rounded-full w-fit p-1"
          href={song.album_url ?? "#"}
        >
          From {decode(song.album as string)}
        </Link>
        <Link
          className="flex gap-2 text-xs items-center text-muted-foreground bg-muted w-fit rounded-full hover:text-primary font-bold"
          target="_blank"
          rel="noopener noreferrer"
          href={song.album_url || "#"}
        >
          {artistImageUrl && (
            <Image
              className="rounded-full"
              src={artistImageUrl ?? "/profile-circle.png"}
              height={25}
              width={25}
              alt={song.primary_artist_name as string}
            />
          )}
          <span className="pr-2">{song.primary_artist_name}</span>
        </Link>
        <div className="flex flex-wrap text-xs font-medium text-muted-foreground gap-2">
          <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <span>
              <Clock size={"14px"} />
            </span>
            {formatDuration(parseInt(song.duration,10))}
          </p>
          {song.play_count && (
<p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <span>
              <Disc size={"14px"} />
            </span>
            {formatViews(song.play_count as number)}
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
          <PlayCard song={song} />
        </div>
      </div>
    </div>
  );
};

export default SongCard;
