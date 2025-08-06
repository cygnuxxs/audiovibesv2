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
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { audioManager } from "./hooks/audioManager";

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
  const ffmpegRef = useRef<FFmpeg | null>(null); // Ref for FFmpeg instance, initialized lazily

  const apiUrl = useMemo(() => `${API_BASE_URL}/${id}`, [id]);

  // Lazy-load FFmpeg only when needed (optimization: defers memory allocation)
  const loadFFmpeg = useCallback(async () => {
    if (!ffmpegRef.current) {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      ffmpegRef.current = ffmpeg;
    }
    return ffmpegRef.current;
  }, []);

  // Fetch song URL from API (unchanged, but used in both play and download)
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

  // Play/pause logic (minor tweaks for efficiency)
const handlePlayback = useCallback(async () => {
  const audio = audioRef.current;
  if (!audio) return;

  // Handle pause/stop
  if (isPlaying) {
    audio.pause();
    audioManager.stopCurrent();
    setPlaying(false);
    return;
  }

  // Helper function for audio loading
  const loadAudioSource = async () => {
    const result = await fetchAudioUrl();
    if (!result) throw new Error('Failed to fetch audio');

    const { url, songName } = result;
    setAudioUrl(url);
    audio.src = url;

    // Wait for audio to be ready
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(loadTimeout);
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
      };

      const onCanPlay = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('Audio failed to load'));
      };

      const loadTimeout = setTimeout(() => {
        cleanup();
        reject(new Error('Audio loading timed out'));
      }, AUDIO_LOAD_TIMEOUT);

      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);
    });

    return songName;
  };

  // Play audio
  const playAudio = async () => {
    let songName = videoTitle; // fallback

    // Load new audio source if needed
    if (!audio.src || error) {
      setLoading(true);
      try {
        songName = await loadAudioSource();
      } catch (err) {
        throw new Error(
          `Failed to load audio: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setLoading(false);
      }
    }

    // Set as current and play
    audioManager.setCurrentAudio(id, audio);
    await audio.play();
    setPlaying(true);
    toast.success(`Now playing: ${decode(songName)}`);
  };

  // Execute play with error handling
  try {
    await playAudio();
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to play audio';
    toast.error(errorMessage);
    console.error('Playback error:', err);
    setError('Playback failed');
    audioManager.stopCurrent();
  }
}, [isPlaying, fetchAudioUrl, error, id, videoTitle]);

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
      // Fetch URL if not available (avoids re-fetch if already set from playback)
      setLoading(true);
      const result = await fetchAudioUrl();
      if (!result) {
        setLoading(false);
        toast.error("Failed to load audio URL for download");
        return;
      }
      setAudioUrl(result.url);
      // Note: We don't set audio.src here since we're not playing
    }

    const ffmpeg = await loadFFmpeg(); // Lazy-load to save memory
    if (!ffmpeg) {
      toast.error("Failed to load conversion tools");
      return;
    }

    setLoading(true);
    try {
      if (!audioUrl) {
        throw new Error("Audio URL is not available");
      }
      const response = await fetch(audioUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const inputFileName = "input.audio";
      const outputFileName = `${videoTitle} from ${album}.mp3`;

      // Write to FFmpeg FS
      ffmpeg.writeFile(inputFileName, new Uint8Array(arrayBuffer as ArrayBuffer));

      // Convert to MP3
      await ffmpeg.exec([
        "-i",
        inputFileName,
        "-c:a",
        "libmp3lame",
        "-q:a",
        "2",
        outputFileName,
      ]);

      // Read output
      const data = await ffmpeg.readFile(outputFileName);
      // Ensure data is a Uint8Array with a standard ArrayBuffer
      const uint8Data = new Uint8Array((data as Uint8Array).buffer as ArrayBuffer);
      const blob = new Blob([uint8Data], { type: "audio/mpeg" });
      const blobUrl = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = outputFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Optimization: Clean up FFmpeg files to free memory immediately
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      toast.success(`Downloaded: ${outputFileName}`);
    } catch (err) {
      console.error("Download/Conversion error:", err);
      toast.error("Failed to download or convert audio");
    } finally {
      setLoading(false);
    }
  }, [audioUrl, videoTitle, album, loadFFmpeg, fetchAudioUrl]);

  // Cleanup effect (added FFmpeg termination for full unload)
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
      }
      if (ffmpegRef.current) {
        ffmpegRef.current.terminate(); // Unload FFmpeg to free memory
        ffmpegRef.current = null;
      }
    };
  }, []);

  const buttonStates = useMemo(
    () => ({
      playDisabled: isLoading,
      downloadDisabled: isLoading,
      playButtonClass: cn(
        "transition-colors duration-200",
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

  const DownloadButton = (
    <Button
      size={"sm"}
      onClick={handleDownload}
      disabled={buttonStates.downloadDisabled}
      variant="outline"
      className="flex items-center gap-2"
      aria-label={`Download ${videoTitle}`}
    >
      <Download className="w-5 h-5" />
      <span className="ml-2">Download</span>
    </Button>
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
