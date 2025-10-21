'use client'
import React, {useState, useMemo, useCallback, useTransition} from 'react'
import { decode } from 'he';
import {toast} from 'sonner'
import useFFmpeg from './hooks/useFfmpeg';
import { addSongMetadata, downloadBlob, cn } from '@/lib/utils';
import useAudioPlayer from './hooks/useAudioPlayer';
import { PauseCircle, CirclePlay, Download } from 'lucide-react';
import { Button } from './ui/button';
import SmallSpinner from './ui/loading/small-spinner';
import { incrementDownloads } from '@/lib/actions';

const PlayCard = ({ song }: { song: Song }) => {
  const { id, title, album } = song;

  const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [audioSrcUrl, setAudioSrcUrl] = useState<string | null>(null); // To store the fetched URL for download reuse
  const { audioRef, isPlaying, isLoadingAudio, togglePlayback } = useAudioPlayer(id, title, song.downloadUrl);
  const {loadFFmpeg, isFFmpegLoading, ffmpegError } = useFFmpeg();
  const [isPending, startTransition] = useTransition()

  const handleDownload = useCallback(async () => {
    setIsProcessingDownload(true);

    let currentAudioUrl = audioSrcUrl; // Prefer already fetched URL

    try {
      if (!currentAudioUrl) {
        currentAudioUrl = song.downloadUrl;
        setAudioSrcUrl(currentAudioUrl); // Store it for future use
      }

      if (!currentAudioUrl) {
        throw new Error("Audio URL is not available for download.");
      }

      const loadedFFmpeg = await loadFFmpeg();
      if (!loadedFFmpeg) {
        throw new Error(ffmpegError || "Failed to load conversion tools.");
      }

      toast.info("Downloading and converting audio...", { duration: 5000 });
      console.log(currentAudioUrl)
      const response = await fetch(currentAudioUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Failed to fetch audio stream: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      const inputFileName = "input.audio";
      const outputFileName = `${decode(title)} - ${decode(album || 'Unknown Album')}.mp3`;

      // Write to FFmpeg FS
      loadedFFmpeg.writeFile(inputFileName, new Uint8Array(arrayBuffer));

      // Convert to MP3 using libmp3lame with VBR quality 2 (good quality)
      await loadedFFmpeg.exec([
        "-i",
        inputFileName,
        "-c:a",
        "libmp3lame",
        "-q:a", // Variable BitRate quality scale (0-9, 0 is highest)
        "2",
        outputFileName,
      ]);

      // Read output
      const data = await loadedFFmpeg.readFile(outputFileName, 'binary');
      const encoder = new TextEncoder()
      // Ensure data is Uint8Array
      const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(encoder.encode(data));

      // Add metadata to the buffer
      const updatedBuffer = await addSongMetadata(uint8Data.buffer as ArrayBuffer, song);
      const blob = new Blob([updatedBuffer], { type: "audio/mpeg" });

      downloadBlob(blob, outputFileName); // Use helper for download

      // Clean up FFmpeg files
      loadedFFmpeg.deleteFile(inputFileName);
      loadedFFmpeg.deleteFile(outputFileName);
      startTransition(() => incrementDownloads())
      toast.success(`Downloaded: ${outputFileName}`);
    } catch (err) {
      console.error("Download/Conversion error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during download.";
      toast.error(`Failed to download or convert audio: ${errorMessage}`);
    } finally {
      setIsProcessingDownload(false);
    }
  }, [audioSrcUrl, title, album, song, loadFFmpeg, ffmpegError]);


  const isBusy = isLoadingAudio || isProcessingDownload || isFFmpegLoading || isPending;

  const PlayButtonContent = useMemo(() => {
    if (isLoadingAudio) {
      return (
        <>
          <SmallSpinner />
          <span className="ml-2">Loading...</span>
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
        <span className="ml-2">{isPlaying ? "Pause" : "Play"}</span>
      </>
    );
  }, [isPlaying, isLoadingAudio]);


  return (
    <>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={togglePlayback}
          disabled={isBusy}
          className={cn("transition-colors duration-200")}
          aria-label={`${isPlaying ? "Pause" : "Play"} ${title}`}
        >
          {PlayButtonContent}
        </Button>
        <Button
          size={"sm"}
          onClick={handleDownload}
          disabled={isBusy}
          variant="outline"
          className="flex items-center gap-2"
          aria-label={`Download ${title}`}
        >
          {isProcessingDownload ? <SmallSpinner /> : <Download className="w-5 h-5" />}
          <span className="ml-2">{isProcessingDownload ? "Processing..." : "Download"}</span>
        </Button>
      </div>
    </>
  );
};

export default PlayCard