'use client'
import React, { useState, useMemo, useCallback, useTransition } from 'react'
import { decode } from 'he';
import { toast } from 'sonner'
import useFFmpeg from './hooks/useFfmpeg';
import { addSongMetadata, downloadBlob, cn } from '@/lib/utils';
import useAudioPlayer from './hooks/useAudioPlayer';
import { PauseCircle, CirclePlay, Download } from 'lucide-react';
import { Button } from './ui/button';
import SmallSpinner from './ui/loading/small-spinner';
import { Progress } from './ui/progress'; // Ensure this is imported
import { incrementDownloads } from '@/lib/actions';

// Helper to sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>:"\/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);
};

const PlayCard = ({ song }: { song: Song }) => {
  const { id, title, album } = song;

  // State for download management
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0 to 100
  const [downloadStatus, setDownloadStatus] = useState<string>(""); // "Downloading..." or "Converting..."
  const [audioSrcUrl, setAudioSrcUrl] = useState<string | null>(null);

  const { audioRef, isPlaying, isLoadingAudio, togglePlayback } = useAudioPlayer(id, title, song.downloadUrl);
  const { loadFFmpeg, isFFmpegLoading, ffmpegError } = useFFmpeg();
  const [isPending, startTransition] = useTransition();

  const handleDownload = useCallback(async () => {
    setIsProcessingDownload(true);
    setDownloadProgress(0);
    setDownloadStatus("Starting...");

    let currentAudioUrl = audioSrcUrl;

    try {
      // 1. Prepare URL
      if (!currentAudioUrl) {
        currentAudioUrl = song.downloadUrl;
        setAudioSrcUrl(currentAudioUrl);
      }
      if (!currentAudioUrl) throw new Error("Audio URL is not available.");

      // 2. Load FFmpeg
      const loadedFFmpeg = await loadFFmpeg();
      if (!loadedFFmpeg) throw new Error(ffmpegError || "Failed to load conversion tools.");

      // 3. Fetch with Progress Tracking
      setDownloadStatus("Downloading...");
      console.log(currentAudioUrl);

      const response = await fetch(currentAudioUrl, { mode: "cors" });
      if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
      if (!response.body) throw new Error("ReadableStream not supported in this browser.");

      const contentLength = Number(response.headers.get('Content-Length') || 0);
      const reader = response.body.getReader();

      // Array to hold chunks of data
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        // Calculate progress if content-length exists
        if (contentLength > 0) {
          setDownloadProgress(Math.round((receivedLength / contentLength) * 100));
        }
      }

      // Concatenate chunks into a single Uint8Array
      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // 4. Convert with FFmpeg
      setDownloadStatus("Converting...");
      // Reset progress to generic "processing" visual or keep at 100%
      setDownloadProgress(100);

      const uniqueId = Date.now();
      const inputFileName = `input_${uniqueId}.audio`;
      const tempOutputFileName = `output_${uniqueId}.mp3`;
      const sanitizedTitle = sanitizeFilename(decode(title));
      const sanitizedAlbum = sanitizeFilename(decode(album || 'Unknown Album'));
      const finalFileName = `${sanitizedTitle} - ${sanitizedAlbum}.mp3`;

      // Write file to FFmpeg FS
      loadedFFmpeg.writeFile(inputFileName, allChunks);

      // Execute conversion
      await loadedFFmpeg.exec([
        "-i", inputFileName,
        "-c:a", "libmp3lame",
        "-q:a", "0",
        tempOutputFileName,
      ]);

      // Read output
      const data = await loadedFFmpeg.readFile(tempOutputFileName, 'binary');
      const encoder = new TextEncoder();
      const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(encoder.encode(data));

      // 5. Metadata & Download
      const updatedBuffer = await addSongMetadata(uint8Data.buffer as ArrayBuffer, song);
      const blob = new Blob([updatedBuffer], { type: "audio/mpeg" });

      downloadBlob(blob, finalFileName);

      // Cleanup
      try {
        loadedFFmpeg.deleteFile(inputFileName);
        loadedFFmpeg.deleteFile(tempOutputFileName);
      } catch (e) { console.warn(e) }

      startTransition(() => incrementDownloads());
      toast.success(`Downloaded: ${finalFileName}`);

    } catch (err) {
      console.error("Download error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Download failed: ${msg}`);
    } finally {
      setIsProcessingDownload(false);
      setDownloadProgress(0);
      setDownloadStatus("");
    }
  }, [audioSrcUrl, song, title, album, loadFFmpeg, ffmpegError]);

  const isBusy = isLoadingAudio || isProcessingDownload || isFFmpegLoading || isPending;

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
        <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
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
                {/* Shows Spinner during conversion, Percentage during download */}
                {downloadStatus === "Converting..." ? (
                   <SmallSpinner />
                ) : (
                   <span className="text-xs font-mono">{downloadProgress}%</span>
                )}
                <span>{downloadStatus === "Converting..." ? "Convert" : "Loading"}</span>
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