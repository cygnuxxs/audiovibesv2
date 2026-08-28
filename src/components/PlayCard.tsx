'use client'
import React, { useState, useMemo, useCallback, useTransition } from 'react'
import { cn } from '@/lib/utils';
import useAudioPlayer from './hooks/useAudioPlayer';
import useDownloadAudio from './hooks/useDownloadAudio';
import { PauseCircle, CirclePlay, Download } from 'lucide-react';
import { Button } from './ui/button';
import SmallSpinner from './ui/loading/small-spinner';
import { Progress } from './ui/progress'; // Ensure this is imported

const PlayCard = ({ song }: { song: Song }) => {
  const { id, title } = song;

  const {
    isProcessingDownload,
    downloadProgress,
    downloadStatus,
    handleDownload,
  } = useDownloadAudio(song);

  const { audioRef, isPlaying, isLoadingAudio, togglePlayback } = useAudioPlayer(id, title, song.downloadUrl);
  const [isPending, startTransition] = useTransition();

  const isBusy = isLoadingAudio || isProcessingDownload || isPending;

  // ... (PlayButtonContent remains the same)
  const PlayButtonContent = useMemo(() => {
    if (isLoadingAudio) {
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
  }, [isPlaying, isLoadingAudio]);

  return (
    <div className="flex flex-col gap-2">
      {/* Wrapping the main controls in a div to allow
         the progress bar to sit underneath if needed
      */}
      <>
        <audio ref={audioRef} preload="metadata" />
        <div className="flex items-center p-1 shadow-lg border border-border rounded-full bg-card gap-2 w-fit">
          <Button
            size="sm"
            onClick={togglePlayback}
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
                {/* Shows Spinner during processing, Percentage during download */}
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