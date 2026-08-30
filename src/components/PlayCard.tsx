'use client'
import React, { useMemo } from 'react'
import { cn } from '@/lib/utils';
import { usePlayer } from '@/lib/player';
import useDownloadAudio from './hooks/useDownloadAudio';
import { PauseCircle, CirclePlay, Download, ListPlus } from 'lucide-react';
import { Button } from './ui/button';
import SmallSpinner from './ui/loading/small-spinner';
import { Progress } from './ui/progress';

const PlayCard = ({ song }: { song: Song }) => {
  const { id } = song;

  const {
    isProcessingDownload,
    downloadProgress,
    downloadStatus,
    handleDownload,
  } = useDownloadAudio(song);

  const player = usePlayer();

  const isCurrentSong = player.currentSong?.id === id;
  const isPlaying = isCurrentSong && player.isPlaying;
  const isLoading = isCurrentSong && player.isLoadingSong;

  const isBusy = isLoading || isProcessingDownload;

  const PlayButtonContent = useMemo(() => {
    if (isLoading) {
      return (
        <>
          <SmallSpinner />
          <span>Loading...</span>
        </>
      );
    }
    return (
      <>
        {isPlaying ? (
          <PauseCircle className="w-5 h-5" />
        ) : (
          <CirclePlay className="w-5 h-5" />
        )}
        <span>{isPlaying ? "Pause" : "Play"}</span>
      </>
    );
  }, [isPlaying, isLoading]);

  const handlePlayClick = () => {
    if (isCurrentSong) {
      player.togglePlayback();
    } else {
      player.play(song);
    }
  };

  const handleAddToQueue = () => {
    player.addToQueue(song);
  };

  return (
    <div className="flex flex-col gap-2">
      <>
        <div className="flex items-center p-1 shadow-lg border border-border rounded-full bg-card gap-2 w-fit">
          <Button
            size="sm"
            onClick={handlePlayClick}
            disabled={isBusy}
            className={cn("transition-colors rounded-full shadow-primary duration-200")}
          >
            {PlayButtonContent}
          </Button>

          <Button
            size={"sm"}
            onClick={handleDownload}
            disabled={isBusy}
            variant="secondary"
            className="flex items-center rounded-full gap-2 min-w-[120px]"
          >
            {isProcessingDownload ? (
              <div className="flex items-center gap-2">
                {downloadStatus === "Processing..." ? (
                  <SmallSpinner />
                ) : (
                  <span className="text-xs font-mono">{downloadProgress}%</span>
                )}
                <span>{downloadStatus === "Processing..." ? "Processing" : "Loading"}</span>
              </div>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleAddToQueue}
            variant="ghost"
            className="rounded-full px-2"
            aria-label="Add to queue"
            title="Add to queue"
          >
            <ListPlus className="w-4 h-4" />
          </Button>
        </div>
      </>
      {isProcessingDownload && downloadStatus === "Downloading..." && (
        <div className="w-full max-w-[200px] px-2">
          <Progress value={downloadProgress} className="h-1.5" />
        </div>
      )}
    </div>
  );
};

export default PlayCard;