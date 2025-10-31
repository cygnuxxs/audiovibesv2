import { useRef, useState, useCallback, useEffect } from "react";
import { decode } from "he";
import { toast } from "sonner";
import { audioManager } from "./audioManager";
/**
 * Hook to manage the audio element's state and events.
 */
const AUDIO_LOAD_TIMEOUT = 10000;
export default function useAudioPlayer(
  songId: string,
  songName: string,
  songDownloadUrl: string
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); // State for audio buffer/load
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const loadAndPlayAudio = useCallback(
    (audioSrc: string): Promise<void> => {
      const audio = audioRef.current;
      if (!audio) return Promise.reject(new Error("Audio element not found"));

      audio.src = audioSrc; // Set src early to start loading
      setIsLoadingAudio(true); // Indicate audio is buffering/loading
      setPlaybackError(null);

      return new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(loadTimeout);
          audio.removeEventListener("canplaythrough", onCanPlay);
          audio.removeEventListener("error", onError);
        };

        const onCanPlay = () => {
          cleanup();
          setIsLoadingAudio(false);
          audioManager.setCurrentAudio(songId, audio);
          audio
            .play()
            .then(() => {
              setPlaying(true);
              toast.success(`Now playing: ${decode(songName)}`);
              resolve();
            })
            .catch((playErr: unknown) => {
              console.error("Audio play failed:", playErr);
              const errorMsg = "Failed to start playback.";
              setPlaybackError(errorMsg);
              toast.error(errorMsg);
              audioManager.stopCurrent();
              reject(playErr as Error);
            });
        };

        const onError = (event: Event) => {
          cleanup();
          setIsLoadingAudio(false);
          const target = event.target as HTMLAudioElement;
          let errorMessage = "Playback error";
          if (target.error) {
            switch (target.error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage = "Playback aborted";
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
              default:
                errorMessage = `Media error: ${target.error.code}`;
                break;
            }
          }
          console.error("Audio element error:", errorMessage, target.error);
          setPlaybackError(errorMessage);
          toast.error(errorMessage);
          audioManager.stopCurrent();
          reject(new Error(errorMessage));
        };

        const loadTimeout = setTimeout(() => {
          cleanup();
          setIsLoadingAudio(false);
          const timeoutError = "Audio loading timed out";
          setPlaybackError(timeoutError);
          toast.error(timeoutError);
          audioManager.stopCurrent();
          reject(new Error(timeoutError));
        }, AUDIO_LOAD_TIMEOUT);

        audio.addEventListener("canplaythrough", onCanPlay);
        audio.addEventListener("error", onError);
        audio.load(); // Request the audio to load
      });
    },
    [songId, songName] // Dependencies for toast and audioManager calls
  );
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audioManager.stopCurrent();
      setPlaying(false);
      return;
    }

    // If not playing, try to play
    try {
      let currentAudioUrl = songDownloadUrl;
      if (!currentAudioUrl || playbackError) {
        // Re-fetch if no URL or previous error
        currentAudioUrl = songDownloadUrl;
      }
      await loadAndPlayAudio(currentAudioUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to play audio";
      console.error("Playback initiation error:", err);
      setPlaybackError(errorMessage);
      toast.error(errorMessage);
      audioManager.stopCurrent();
    }
  }, [isPlaying, songDownloadUrl, loadAndPlayAudio, playbackError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setPlaying(false);
      toast.success("Playback completed");
      audioManager.stopCurrent(); // Ensure manager is aware
    };
    const handlePause = () => setPlaying(false);
    const handlePlay = () => setPlaying(true);
    const handleLoadStart = () => setPlaybackError(null); // Clear errors on new load attempt

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("loadstart", handleLoadStart);
      // Ensure audio is stopped and src cleared on unmount
      // Use requestAnimationFrame to avoid forced reflow during cleanup
      requestAnimationFrame(() => {
        audio.pause();
        audio.src = "";
        audio.load(); // This will clear the audio buffer
      });
    };
  }, []);

  return { audioRef, isPlaying, isLoadingAudio, playbackError, togglePlayback };
}
