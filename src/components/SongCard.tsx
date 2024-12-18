import {Clock, Disc, Download, History } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Video } from "youtube-sr";
import { formatViews } from "@/lib/utils";
import { Button } from "./ui/button";
import PlayCard from "./PlayCard";

const SongCard: React.FC<{ song: Video }> = ({ song }) => {
  const jsonData = song.toJSON();
  return (
    <div className="flex h-[8rem] w-full gap-3 ">
      <Image
        className="w-[200px] rounded-md h-auto"
        src={String(song.thumbnail?.url)}
        height={song.thumbnail?.height}
        width={song.thumbnail?.width}
        alt={String(song.title)}
      />
      <div className="flex flex-col gap-2">
        <h2 className="line-clamp-1 text-sm">{song.title}</h2>
        <Link
          className="flex gap-2 text-xs items-center text-muted-foreground bg-muted w-fit rounded-full hover:text-primary font-bold"
          target="_blank"
          rel="noopener noreferrer"
          href={song.channel?.url || "#"}
        >
          <Image
            className="rounded-full"
            src={jsonData.channel.icon}
            height={25}
            width={25}
            alt={jsonData.channel.name}
          />
          <span className="pr-2">{song.channel?.name}</span>
        </Link>
        <div className="flex text-xs font-medium text-muted-foreground gap-2">
          <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <span>
              <Clock size={"14px"} />
            </span>
            {jsonData.duration_formatted}
          </p>
          <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <span>
              <Disc size={"14px"} />
            </span>
            {formatViews(jsonData.views)}
          </p>
          <p className="bg-muted px-1 flex gap-1 items-center rounded-md">
            <span>
              <History size={"14px"} />
            </span>
            {jsonData.uploadedAt}
          </p>
        </div>
        <div className="flex gap-2">
          <PlayCard id = {jsonData.id} />
          <Button className="h-8" size={'sm'}><Download />Download</Button>
        </div>
      </div>
    </div>
  );
};

export default SongCard;
