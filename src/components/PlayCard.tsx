"use client";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { CirclePlay, PauseCircle } from "lucide-react";
import Spinner from "@/app/loaders/Spinner";

const PlayCard: React.FC<{ id: string }> = ({ id }) => {
  const [isLoading, setLoading] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [audioTitle, setAudioTitle] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayStream = async () => {
    if (audioBlob) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          await audioRef.current.play();
          setPlaying(true);
          toast.success(`${audioTitle || "Audio"} is now playing!`);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const audioUrl = `/api/play?id=${id}`;

      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch audio stream");
      }

      const title = response.headers.get('Song-Title');
      if (title && !audioTitle) {
        setAudioTitle(title); // Set audio title only if not already set
      }

      const blob = await response.blob();
      setAudioBlob(blob); // Cache the blob

      const audioObjectUrl = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = audioObjectUrl;
        await audioRef.current.play();
        setPlaying(true);
        toast.success(`${audioTitle || title || "Audio"} is now playing!`);
      }
    } catch (err) {
      console.error("Error playing the audio stream:", err);
      toast.error("Failed to play the audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex items-center gap-4">
          {!isPlaying ? (
            <Button
              onClick={handlePlayStream}
              size="sm"
              disabled={isPlaying}
            >
              <CirclePlay className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="sm"
            >
              <PauseCircle className="w-6 h-6" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayCard;
