"use client";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { CirclePlay, PauseCircle, Download } from "lucide-react";
import Spinner from "@/app/loaders/Spinner";
import { cn } from "@/lib/utils";
import { decode } from "he";
import {FFmpeg} from "@ffmpeg/ffmpeg"; // Import FFmpeg.js for audio conversion

interface PlayCardProps {
  id: string;
  videoTitle: string;
  album?: string;
}

const API_BASE_URL = "https://saavn.dev/api/songs";
const AUDIO_LOAD_TIMEOUT = 10000;

const PlayCard: React.FC<PlayCardProps> = ({ id, videoTitle, album }) => {
  const [isLoading, setLoading] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const ffmpegRef = useRef<FFmpeg>(null); // Ref for FFmpeg instance

  const apiUrl = useMemo(() => `${API_BASE_URL}/${id}`, [id]);

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      await ffmpeg.load();
    };
    loadFFmpeg();
  }, []);

  // Fetch song URL from API
  const fetchAudioUrl = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    try {
      setError(null);
      const response = await fetch(apiUrl, {
        mode: "cors",
        signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);
      const result = await response.json();
      if (!result.success || !result.data?.length)
        throw new Error("Song data not found");
      const songData = result.data[0];
      const songName = decode(songData.name);
      const downloadUrls = songData.downloadUrl;
      if (!downloadUrls?.length) throw new Error("No streamable URLs found");
      const highestQualityUrl = downloadUrls[downloadUrls.length - 1]?.url;
      if (!highestQualityUrl) throw new Error("Invalid audio URL");
      return { url: highestQualityUrl, songName };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") return null;
        setError(error.message);
        toast.error(`Could not fetch song: ${error.message}`);
      } else {
        setError("Unknown error occurred");
        toast.error("Unknown error occurred");
      }
      return null;
    }
  }, [apiUrl]);

  // Play/pause logic (unchanged)
  const handlePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (audio.src && !error) {
      try {
        await audio.play();
        setPlaying(true);
      } catch (err) {
        toast.error("Failed to resume playback");
        console.error("Playback error:", err);
        setError("Playback failed");
      }
      return;
    }
    setLoading(true);
    try {
      const result = await fetchAudioUrl();
      if (result && audio) {
        const { url, songName } = result;
        setAudioUrl(url);
        audio.src = url;
        const loadTimeout = setTimeout(() => {
          toast.error("Audio loading timed out");
          setLoading(false);
        }, AUDIO_LOAD_TIMEOUT);
        await new Promise<void>((resolve, reject) => {
          const onCanPlay = () => {
            clearTimeout(loadTimeout);
            audio.removeEventListener("canplay", onCanPlay);
            audio.removeEventListener("error", onError);
            resolve();
          };
          const onError = () => {
            clearTimeout(loadTimeout);
            audio.removeEventListener("canplay", onCanPlay);
            audio.removeEventListener("error", onError);
            reject(new Error("Audio failed to load"));
          };
          audio.addEventListener("canplay", onCanPlay);
          audio.addEventListener("error", onError);
        });
        await audio.play();
        setPlaying(true);
        toast.success(`Now playing: ${decode(songName)}`);
      }
    } catch (err) {
      toast.error("Failed to play audio");
      console.error("Playback error:", err);
      setError("Playback failed");
    } finally {
      setLoading(false);
    }
  }, [isPlaying, fetchAudioUrl, error]);

  // Effect for playback/cleanup (unchanged)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      setPlaying(false);
      toast.success("Playback completed");
    };
    const handleError = (event: Event) => {
      const target = event.target as HTMLAudioElement;
      setPlaying(false);
      let errorMessage = "Playback error";
      if (target.error) {
        switch (target.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Playback was aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Decode error";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Unsupported format";
            break;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    };
    const handleLoadStart = () => setError(null);
    const handlePause = () => setPlaying(false);
    const handlePlay = () => setPlaying(true);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  const handleDownload = useCallback(async () => {
    if (!audioUrl) {
      toast.error("No audio URL available. Please play the song first to load the URL.");
      return;
    }
    if (!ffmpegRef.current?.loaded) {
      toast.error("FFmpeg is not loaded yet. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(audioUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const inputFileName = "input.audio"; // Temporary name for input
      const outputFileName = `${videoTitle} from ${album}.mp3`;

      // Ensure arrayBuffer is an ArrayBuffer, not ArrayBufferLike
      const validArrayBuffer =
        arrayBuffer instanceof ArrayBuffer
          ? arrayBuffer
          : new Uint8Array(arrayBuffer).buffer;

      // Write the fetched audio data to FFmpeg's virtual file system
      ffmpegRef.current.writeFile(inputFileName, new Uint8Array(validArrayBuffer));

      // Run FFmpeg command to convert to MP3
      await ffmpegRef.current.exec([
        "-i",
        inputFileName,
        "-c:a",
        "libmp3lame", // Use LAME encoder for MP3
        "-q:a",
        "2", // Quality setting (0-9, lower is better)
        outputFileName
      ]);

      // Read the output file
      const data = await ffmpegRef.current.readFile(outputFileName);
      // Convert data to Uint8Array properly
      const uint8Data = new Uint8Array(
        data instanceof Uint8Array ? data : Buffer.from(data as string)
      );
      const blob = new Blob([uint8Data], { type: "audio/mpeg" });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = outputFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
      toast.success(`Downloaded: ${outputFileName}`);
    } catch (err) {
      console.error("Download/Conversion error:", err);
      toast.error("Failed to download or convert audio");
    } finally {
      setLoading(false);
    }
  }, [audioUrl, videoTitle, album]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
      }
    };
  }, []);

  const buttonStates = useMemo(
    () => ({
      playDisabled: isLoading,
      downloadDisabled: isLoading,
      playButtonClass: cn(
        "transition-colors duration-200",
        isPlaying && "bg-green-600 hover:bg-green-500"
      ),
      playIcon: isLoading ? (
        <Spinner />
      ) : isPlaying ? (
        <PauseCircle className="w-5 h-5" />
      ) : (
        <CirclePlay className="w-5 h-5" />
      ),
      playLabel: isLoading ? "Loading..." : isPlaying ? "Pause" : "Play",
    }),
    [isLoading, isPlaying]
  );

  const DownloadButton = React.useMemo(
    () => (
      <Button
        size={"sm"}
        onClick={handleDownload}
        disabled={buttonStates.downloadDisabled || !audioUrl}
        variant="outline"
        className="flex items-center gap-2"
        aria-label={`Download ${videoTitle}`}
      >
        <Download className="w-5 h-5" />
        <span className="ml-2">Download</span>
      </Button>
    ),
    [audioUrl, buttonStates.downloadDisabled, videoTitle, handleDownload]
  );

  return (
    <>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handlePlayback}
          disabled={buttonStates.playDisabled}
          className={buttonStates.playButtonClass}
          aria-label={`${buttonStates.playLabel} ${videoTitle}`}
        >
          {buttonStates.playIcon}
          <span className="ml-2">{buttonStates.playLabel}</span>
        </Button>
        {DownloadButton}
      </div>
    </>
  );
};

export default PlayCard;
