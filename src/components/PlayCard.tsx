"use client";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { CirclePlay, PauseCircle, Download } from "lucide-react";
import Spinner from "@/app/loaders/Spinner";

const PlayCard: React.FC<{ id: string, videoTitle : string }> = ({ id, videoTitle }) => {
  const [isLoading, setLoading] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [audioTitle, setAudioTitle] = useState<string>("Unknown Audio");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch the audio blob and title from the server
  const fetchAudioBlob = async () => {
    const audioUrl = `/api/play?id=${id}?title=${encodeURIComponent(videoTitle)}`;

    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch audio stream");
    }

    const title = videoTitle || "Unknown Audio"; // Fallback title
    const blob = await response.blob();

    return { blob, title };
  };

  // Handle play stream logic
  const handlePlayStream = async () => {
    if (audioBlob) {
      // Use cached blob if available
      if (audioRef.current) {
        if (audioRef.current.paused) {
          await audioRef.current.play();
          setPlaying(true);
          toast.success(`${audioTitle} is now playing!`);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const { blob, title } = await fetchAudioBlob();
      setAudioBlob(blob); // Cache the blob
      setAudioTitle(title); // Set the title

      const audioObjectUrl = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = audioObjectUrl;
        await audioRef.current.play();
        setPlaying(true);
        toast.success(`${title} is now playing!`); // Use the fetched title
      }
    } catch (err) {
      console.error("Error playing the audio stream:", err);
      toast.error("Failed to play the audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pause audio playback
  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  // Handle audio download
  const handleDownload = async () => {
    try {
      let blob = audioBlob;
      let title = audioTitle;

      // Fetch the blob and title if not cached
      if (!blob) {
        setLoading(true);
        const result = await fetchAudioBlob();
        blob = result.blob;
        title = result.title;
        setAudioBlob(blob); // Cache the blob for reuse
        setAudioTitle(title); // Update the title
      }

      // Ensure the blob is valid
      if (!blob) {
        throw new Error("Failed to fetch audio blob");
      }

      // Trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title}.mp3`; // Use the fetched or cached title
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloading: ${title}`); // Show title in the toast
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast.error("Failed to download the audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <Button onClick={handlePlayStream} size="sm" disabled={isPlaying}>
              <CirclePlay className="w-6 h-6" /> Play
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="sm"
              className="animate-pulse"
            >
              <PauseCircle className="w-6 h-6" />
              Pause
            </Button>
          )}

          <Button onClick={handleDownload} size="sm" className="h-8">
            <Download className="w-6 h-6" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlayCard;
