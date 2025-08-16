import { useMemo, useCallback, useRef, useEffect } from "react";
import { decode } from "he";
import { toast } from "sonner";

const API_BASE_URL = "https://saavn.dev/api/songs";
/**
 * Hook for fetching song audio URLs from the API.
 */
export default function useSongAudioFetcher(songId: string) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const apiUrl = useMemo(() => `${API_BASE_URL}/${songId}`, [songId]);

  const fetchAudioUrl = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      const response = await fetch(apiUrl, {
        mode: "cors",
        signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const result = await response.json();
      if (!result.success || !result.data?.length) {
        throw new Error("Song data not found");
      }
      const songData = result.data[0];
      const songName = decode(songData.name);
      const downloadUrls = songData.downloadUrl;
      if (!downloadUrls?.length) {
        throw new Error("No streamable URLs found");
      }
      const highestQualityUrl = downloadUrls[downloadUrls.length - 1]?.url;
      if (!highestQualityUrl) {
        throw new Error("Invalid audio URL");
      }
      return { url: highestQualityUrl, songName };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return null; // Request was aborted
      }
      console.error("Fetch audio URL error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Could not fetch song: ${errorMessage}`);
      throw new Error(errorMessage); // Re-throw to be caught by calling function
    } finally {
      abortControllerRef.current = null; // Clear controller after use
    }
  }, [apiUrl]);

  useEffect(() => {
    // Cleanup: Abort any pending fetch on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { fetchAudioUrl };
}
