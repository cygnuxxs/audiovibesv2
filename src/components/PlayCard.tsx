"use client";
import React, { useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { CirclePlay, PauseCircle, Download } from "lucide-react";
import Spinner from "@/app/loaders/Spinner";
import { cn } from "@/lib/utils";

interface PlayCardProps {
  id: string;
  videoTitle: string;
}

const PlayCard: React.FC<PlayCardProps> = ({ id, videoTitle }) => {
  const [isLoading, setLoading] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Fetch the audio blob from the server
  const fetchAudioBlob = useCallback(async () => {
    const audioUrl = `/api/play?id=${id}`;
    const response = await fetch(audioUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    const blob = await response.blob();
    setCachedBlob(blob);
    return blob;
  }, [id]);

  // Clean up the blob URL
  const cleanupBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Handle audio playback
  const handlePlayback = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      // Handle pause
      if (isPlaying) {
        audioRef.current.pause();
        setPlaying(false);
        return;
      }

      setLoading(true);

      let blob: Blob;
      // Use cached blob if available, otherwise fetch
      if (cachedBlob) {
        blob = cachedBlob;
      } else {
        blob = await fetchAudioBlob();
      }

      // Create new blob URL
      cleanupBlobUrl();
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;
      audioRef.current.src = blobUrl;

      await audioRef.current.play();
      setPlaying(true);
      toast.success(`${videoTitle} is now playing!`);
    } catch (error) {
      console.error("Playback error:", error);
      toast.error("Failed to play audio. Please try again.");
      cleanupBlobUrl();
      setCachedBlob(null);
    } finally {
      setLoading(false);
    }
  }, [videoTitle, fetchAudioBlob, cleanupBlobUrl, cachedBlob, isPlaying]);

  // Handle download
  const handleDownload = useCallback(async () => {
    try {
      setLoading(true);

      // Use cached blob if available, otherwise fetch
      const blob = cachedBlob || await fetchAudioBlob();

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${videoTitle}.opus`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup download URL
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
      
      toast.success(`Downloading: ${videoTitle}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download audio. Please try again.");
      setCachedBlob(null);
    } finally {
      setLoading(false);
    }
  }, [videoTitle, fetchAudioBlob, cachedBlob]);

  // Reset play state when audio ends
  const handleAudioEnd = useCallback(() => {
    setPlaying(false);
  }, []);

  // Handle audio error
  const handleAudioError = useCallback(() => {
    setPlaying(false);
    cleanupBlobUrl();
    setCachedBlob(null);
    toast.error("Audio playback error. Please try again.");
  }, [cleanupBlobUrl]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanupBlobUrl();
      setCachedBlob(null);
    };
  }, [cleanupBlobUrl]);

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnd}
        onError={handleAudioError}
      />
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayback} 
            size="sm" 
            disabled={isLoading}
            className={cn(isPlaying && 'animate-pulse')}
          >
            {!isPlaying ? (
              <>
                <CirclePlay className="w-6 h-6" /> Play
              </>
            ) : (
              <>
                <PauseCircle className="w-6 h-6" /> Pause
              </>
            )}
            {isLoading && <Spinner />}
          </Button>

          <Button 
            onClick={handleDownload} 
            size="sm" 
            className="h-8"
            disabled={isLoading}
          >
            <Download className="w-6 h-6" />
            Download
          </Button>
        </div>
    </div>
  );
};

export default PlayCard;