'use client'
import { useRef, useCallback, useState, useEffect } from "react";
import type { FFmpeg } from '@ffmpeg/ffmpeg';

let sharedFFmpeg: FFmpeg | null = null;
let sharedLoadPromise: Promise<FFmpeg | null> | null = null;

export default function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(false);
  const [ffmpegError, setFFmpegError] = useState<string | null>(null);

  const loadFFmpeg = useCallback(async () => {
    if (sharedFFmpeg) {
      ffmpegRef.current = sharedFFmpeg;
      return sharedFFmpeg;
    }

    if (sharedLoadPromise) {
      const loadedFFmpeg = await sharedLoadPromise;
      ffmpegRef.current = loadedFFmpeg;
      return loadedFFmpeg;
    }

    setIsFFmpegLoading(true);
    setFFmpegError(null);
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      sharedLoadPromise = (async () => {
        const ffmpeg = new FFmpeg();
        await ffmpeg.load();
        sharedFFmpeg = ffmpeg;
        return ffmpeg;
      })();

      const loadedFFmpeg = await sharedLoadPromise;
      ffmpegRef.current = loadedFFmpeg;
      return loadedFFmpeg;
    } catch (err) {
      console.error("FFmpeg loading error:", err);
      setFFmpegError("Failed to load conversion tools. Please try again.");
      return null;
    } finally {
      sharedLoadPromise = null;
      setIsFFmpegLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      ffmpegRef.current = null;
    };
  }, []);

  return { ffmpeg: ffmpegRef.current, loadFFmpeg, isFFmpegLoading, ffmpegError };
}