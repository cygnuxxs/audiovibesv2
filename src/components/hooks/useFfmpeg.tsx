'use client'
import { useRef, useCallback, useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
export default function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(false);
  const [ffmpegError, setFFmpegError] = useState<string | null>(null);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current; // Already loaded

    setIsFFmpegLoading(true);
    setFFmpegError(null);
    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      ffmpegRef.current = ffmpeg;
      return ffmpeg;
    } catch (err) {
      console.error("FFmpeg loading error:", err);
      setFFmpegError("Failed to load conversion tools. Please try again.");
      return null;
    } finally {
      setIsFFmpegLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cleanup: Terminate FFmpeg when component unmounts
    return () => {
      if (ffmpegRef.current) {
        ffmpegRef.current.terminate();
        ffmpegRef.current = null;
      }
    };
  }, []);

  return { ffmpeg: ffmpegRef.current, loadFFmpeg, isFFmpegLoading, ffmpegError };
}