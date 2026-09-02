'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { decode } from 'he';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { SongSchema, type Song } from './schemas';

// ─── Types ───────────────────────────────────────────────────────────────────

type RepeatMode = 'none' | 'one' | 'all';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isLoadingSong: boolean;
  isFading: boolean;
  isQueueOpen: boolean;
}

interface PlayerActions {
  play: (song: Song, queue?: Song[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlayback: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleQueuePanel: () => void;
}

type PlayerContextValue = PlayerState & PlayerActions;

// ─── Constants ───────────────────────────────────────────────────────────────

const FADE_DURATION_MS = 800;
const FADE_INTERVAL_MS = 20;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'audiovibes-player-state';

// ─── Context ─────────────────────────────────────────────────────────────────

const PlayerContext = createContext<PlayerContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function loadPersistedState(): Partial<PlayerState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      queue: parsed.queue ?? [],
      queueIndex: parsed.queueIndex ?? -1,
      currentSong: parsed.currentSong ?? null,
      volume: parsed.volume ?? 0.7,
      isMuted: parsed.isMuted ?? false,
      repeatMode: parsed.repeatMode ?? 'none',
      isShuffled: parsed.isShuffled ?? false,
    };
  } catch {
    return null;
  }
}

function persistState(state: Partial<PlayerState>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        queue: state.queue,
        queueIndex: state.queueIndex,
        currentSong: state.currentSong,
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
      })
    );
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetVolumeRef = useRef(0.7);
  const originalQueueRef = useRef<Song[]>([]);
  const isFetchingSuggestionsRef = useRef(false);

  // State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // ── Restore persisted state on mount ──

  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      if (persisted.queue) setQueue(persisted.queue);
      if (persisted.queueIndex !== undefined) setQueueIndex(persisted.queueIndex);
      if (persisted.currentSong) setCurrentSong(persisted.currentSong);
      if (persisted.volume !== undefined) {
        setVolumeState(persisted.volume);
        targetVolumeRef.current = persisted.volume;
      }
      if (persisted.isMuted !== undefined) setIsMuted(persisted.isMuted);
      if (persisted.repeatMode) setRepeatMode(persisted.repeatMode);
      if (persisted.isShuffled !== undefined) setIsShuffled(persisted.isShuffled);
    }
  }, []);

  // ── Persist state on changes ──

  useEffect(() => {
    persistState({ queue, queueIndex, currentSong, volume, isMuted, repeatMode, isShuffled });
  }, [queue, queueIndex, currentSong, volume, isMuted, repeatMode, isShuffled]);

  // ── Inactivity timeout ──

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
        setIsPlaying(false);
        toast.info('Playback paused due to inactivity', { position: "top-center" });
      }
    }, INACTIVITY_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  // ── Fade helpers ──

  const fadeOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const audio = audioRef.current;
      if (!audio || audio.paused) {
        resolve();
        return;
      }
      setIsFading(true);
      const startVolume = audio.volume;
      const steps = Math.ceil(FADE_DURATION_MS / FADE_INTERVAL_MS);
      const decrement = startVolume / steps;
      let step = 0;

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      fadeIntervalRef.current = setInterval(() => {
        step++;
        const newVol = Math.max(0, startVolume - decrement * step);
        audio.volume = newVol;
        if (step >= steps) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          audio.volume = 0;
          setIsFading(false);
          resolve();
        }
      }, FADE_INTERVAL_MS);
    });
  }, []);

  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const target = isMuted ? 0 : targetVolumeRef.current;
    setIsFading(true);
    audio.volume = 0;
    const steps = Math.ceil(FADE_DURATION_MS / FADE_INTERVAL_MS);
    const increment = target / steps;
    let step = 0;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    fadeIntervalRef.current = setInterval(() => {
      step++;
      const newVol = Math.min(target, increment * step);
      audio.volume = newVol;
      if (step >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        audio.volume = target;
        setIsFading(false);
      }
    }, FADE_INTERVAL_MS);
  }, [isMuted]);

  // ── Fetch auto-suggestions ──

  const fetchSuggestions = useCallback(
    async (songId: string) => {
      if (isFetchingSuggestionsRef.current) return;
      isFetchingSuggestionsRef.current = true;
      try {
        const response = await fetch(`/api/suggestions?id=${encodeURIComponent(songId)}&limit=20`);
        if (!response.ok) return;
        const raw = await response.json();
        const suggestions = z.array(SongSchema).parse(raw);
        if (suggestions.length > 0) {
          setQueue((prev) => {
            // Avoid duplicates
            const existingIds = new Set(prev.map((s) => s.id));
            const newSongs = suggestions.filter((s) => !existingIds.has(s.id));
            const updated = [...prev, ...newSongs];
            originalQueueRef.current = [...originalQueueRef.current, ...newSongs];
            return updated;
          });
          toast.info(`Added ${suggestions.length} suggested songs`);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        isFetchingSuggestionsRef.current = false;
      }
    },
    []
  );

  // ── Load and play a song ──

  const loadSong = useCallback(
    async (song: Song, shouldFadeOut = true) => {
      const audio = audioRef.current;
      if (!audio) return;

      setIsLoadingSong(true);

      // Fade out current song
      if (shouldFadeOut && !audio.paused) {
        await fadeOut();
      }

      // Set new source
      audio.pause();
      audio.src = song.downloadUrl;
      audio.load();
      setCurrentSong(song);
      setCurrentTime(0);
      setDuration(0);

      return new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('error', onError);
        };

        const onReady = () => {
          cleanup();
          setIsLoadingSong(false);
          const targetVol = isMuted ? 0 : targetVolumeRef.current;
          audio.volume = 0;
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              fadeIn();
              toast.success(`Now playing: ${decode(song.title)}`, { position: "top-center" });
              updateMediaSession(song);
              resolve();
            })
            .catch((err) => {
              console.error('Playback failed:', err);
              toast.error('Failed to start playback', { position: "top-center" });
              setIsPlaying(false);
              reject(err);
            });
        };

        const onError = () => {
          cleanup();
          setIsLoadingSong(false);
          toast.error('Failed to load audio', { position: "top-center" });
          reject(new Error('Audio load error'));
        };

        const timeout = setTimeout(() => {
          cleanup();
          setIsLoadingSong(false);
          toast.error('Audio loading timed out', { position: "top-center" });
          reject(new Error('Timeout'));
        }, 15000);

        audio.addEventListener('canplaythrough', onReady);
        audio.addEventListener('error', onError);
      });
    },
    [fadeOut, fadeIn, isMuted]
  );

  // ── MediaSession API ──

  const updateMediaSession = useCallback((song: Song) => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: decode(song.title),
      artist: song.primary_artist_name || song.subtitle || '',
      album: song.album ? decode(song.album) : '',
      artwork: [
        { src: song.image.replace('50x50', '150x150'), sizes: '150x150', type: 'image/jpeg' },
        { src: song.image.replace('50x50', '500x500'), sizes: '500x500', type: 'image/jpeg' },
      ],
    });
  }, []);

  // ── Player actions ──

  const play = useCallback(
    (song: Song, newQueue?: Song[]) => {
      if (newQueue && newQueue.length > 0) {
        const idx = newQueue.findIndex((s) => s.id === song.id);
        originalQueueRef.current = [...newQueue];
        if (isShuffled) {
          const shuffled = shuffleArray(newQueue);
          // Move current song to front
          const currentIdx = shuffled.findIndex((s) => s.id === song.id);
          if (currentIdx > 0) {
            [shuffled[0], shuffled[currentIdx]] = [shuffled[currentIdx], shuffled[0]];
          }
          setQueue(shuffled);
          setQueueIndex(0);
        } else {
          setQueue(newQueue);
          setQueueIndex(idx >= 0 ? idx : 0);
        }
      } else if (queue.length === 0 || !queue.find((s) => s.id === song.id)) {
        // Single song play — add to queue
        setQueue((prev) => {
          const updated = [...prev, song];
          originalQueueRef.current = [...originalQueueRef.current, song];
          return updated;
        });
        setQueueIndex((prev) => {
          // New song appended at end
          return queue.length; // length before addition = new index
        });
      } else {
        const idx = queue.findIndex((s) => s.id === song.id);
        if (idx >= 0) setQueueIndex(idx);
      }
      loadSong(song);
      resetInactivityTimer();

      // Auto-populate queue with suggestions when playing a single song
      if (!newQueue || newQueue.length === 0) {
        if (queue.length <= 1) {
          fetchSuggestions(song.id);
        }
      }
    },
    [queue, isShuffled, loadSong, resetInactivityTimer, fetchSuggestions]
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const hasSrc = !!audio.getAttribute('src');

    if (audio.paused) {
      if (!hasSrc && currentSong) {
        loadSong(currentSong, false).catch(() => { });
      } else if (hasSrc) {
        audio.play().then(() => setIsPlaying(true)).catch(() => { });
      }
    }
  }, [currentSong, loadSong]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
    resetInactivityTimer();
  }, [isPlaying, pause, resume, resetInactivityTimer]);

  const next = useCallback(async () => {
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Fetch suggestions to extend queue
        const lastSong = queue[queue.length - 1];
        if (lastSong) {
          await fetchSuggestions(lastSong.id);
        }
        // After fetching, check if queue grew
        // Use a callback form since setQueue is async
        setQueue((currentQueue) => {
          if (queueIndex + 1 < currentQueue.length) {
            const nextSong = currentQueue[queueIndex + 1];
            setQueueIndex(queueIndex + 1);
            loadSong(nextSong);
          }
          return currentQueue;
        });
        resetInactivityTimer();
        return;
      }
    }

    const nextSong = queue[nextIndex];
    if (nextSong) {
      setQueueIndex(nextIndex);
      await loadSong(nextSong);
    }
    resetInactivityTimer();
  }, [queue, queueIndex, repeatMode, loadSong, fetchSuggestions, resetInactivityTimer]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    // If more than 3s in, restart current song
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      resetInactivityTimer();
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    const prevSong = queue[prevIndex];
    if (prevSong) {
      setQueueIndex(prevIndex);
      loadSong(prevSong);
    }
    resetInactivityTimer();
  }, [queue, queueIndex, repeatMode, loadSong, resetInactivityTimer]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v));
      targetVolumeRef.current = clamped;
      setVolumeState(clamped);
      const audio = audioRef.current;
      if (audio && !isFading) {
        audio.volume = isMuted ? 0 : clamped;
      }
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
      }
      resetInactivityTimer();
    },
    [isMuted, isFading, resetInactivityTimer]
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (!isFading) {
      audio.volume = newMuted ? 0 : targetVolumeRef.current;
    }
    resetInactivityTimer();
  }, [isMuted, isFading, resetInactivityTimer]);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => {
      if (prev.find((s) => s.id === song.id)) {
        toast.info(`"${decode(song.title)}" already in queue`, { position: "top-center" });
        return prev;
      }
      originalQueueRef.current = [...originalQueueRef.current, song];
      toast.success(`Added "${decode(song.title)}" to queue`, { position: "top-center" });
      return [...prev, song];
    });
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        // Adjust queueIndex
        if (index < queueIndex) {
          setQueueIndex((i) => i - 1);
        } else if (index === queueIndex) {
          // Currently playing song removed
          if (updated.length > 0) {
            const newIdx = Math.min(index, updated.length - 1);
            setQueueIndex(newIdx);
            loadSong(updated[newIdx]);
          } else {
            setQueueIndex(-1);
            setCurrentSong(null);
            const audio = audioRef.current;
            if (audio) {
              audio.pause();
              audio.src = '';
            }
            setIsPlaying(false);
          }
        }
        return updated;
      });
      resetInactivityTimer();
    },
    [queueIndex, loadSong, resetInactivityTimer]
  );

  const clearQueue = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setQueue([]);
    setQueueIndex(-1);
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    originalQueueRef.current = [];
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const newShuffled = !prev;
      if (newShuffled) {
        setQueue((currentQueue) => {
          const shuffled = shuffleArray(currentQueue);
          // Keep current song at current position
          if (currentSong) {
            const idx = shuffled.findIndex((s) => s.id === currentSong.id);
            if (idx >= 0 && idx !== queueIndex) {
              [shuffled[queueIndex], shuffled[idx]] = [shuffled[idx], shuffled[queueIndex]];
            }
          }
          return shuffled;
        });
        toast.info('Shuffle on', { position: "top-center" });
      } else {
        // Restore original order
        setQueue(originalQueueRef.current);
        if (currentSong) {
          const idx = originalQueueRef.current.findIndex((s) => s.id === currentSong.id);
          if (idx >= 0) setQueueIndex(idx);
        }
        toast.info('Shuffle off', { position: "top-center" });
      }
      return newShuffled;
    });
    resetInactivityTimer();
  }, [currentSong, queueIndex, resetInactivityTimer]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const modes: RepeatMode[] = ['none', 'all', 'one'];
      const nextMode = modes[(modes.indexOf(prev) + 1) % modes.length];
      const labels = { none: 'Repeat off', all: 'Repeat all', one: 'Repeat one' };
      toast.info(labels[nextMode], { position: "top-center" });
      return nextMode;
    });
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const toggleQueuePanel = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  // ── Audio element event handlers ──

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = async () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => { });
        return;
      }
      // Try next
      const nextIdx = queueIndex + 1;
      if (nextIdx < queue.length) {
        setQueueIndex(nextIdx);
        await loadSong(queue[nextIdx]);
      } else if (repeatMode === 'all' && queue.length > 0) {
        setQueueIndex(0);
        await loadSong(queue[0]);
      } else {
        // End of queue — fetch suggestions
        const lastSong = queue[queue.length - 1] || currentSong;
        if (lastSong) {
          await fetchSuggestions(lastSong.id);
          // After fetch, queue might have grown — check and play
          setQueue((currentQueue) => {
            if (nextIdx < currentQueue.length) {
              setQueueIndex(nextIdx);
              loadSong(currentQueue[nextIdx]);
            } else {
              setIsPlaying(false);
            }
            return currentQueue;
          });
        } else {
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode, queueIndex, queue, currentSong, loadSong, fetchSuggestions]);

  // ── MediaSession action handlers ──

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', resume);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('previoustrack', prev);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seek(details.seekTime);
    });
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [resume, pause, prev, next, seek]);

  // ── Keyboard shortcuts ──

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip when typing in inputs
      if (
        (e.target instanceof HTMLElement && e.target.isContentEditable) ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min((audioRef.current?.currentTime ?? 0) + 5, duration));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max((audioRef.current?.currentTime ?? 0) - 5, 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(targetVolumeRef.current + 0.05, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(targetVolumeRef.current - 0.05, 0));
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          next();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          prev();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          toggleShuffle();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          cycleRepeat();
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          toggleQueuePanel();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlayback, seek, setVolume, next, prev, toggleMute, toggleShuffle, cycleRepeat, toggleQueuePanel, duration]);

  // ── Context value ──

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentSong,
      queue,
      queueIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      repeatMode,
      isShuffled,
      isLoadingSong,
      isFading,
      isQueueOpen,
      play,
      pause,
      resume,
      togglePlayback,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      addToQueue,
      removeFromQueue,
      clearQueue,
      toggleShuffle,
      cycleRepeat,
      toggleQueuePanel,
    }),
    [
      currentSong, queue, queueIndex, isPlaying, currentTime, duration, volume,
      isMuted, repeatMode, isShuffled, isLoadingSong, isFading, isQueueOpen,
      play, pause, resume, togglePlayback, next, prev, seek, setVolume, toggleMute,
      addToQueue, removeFromQueue, clearQueue, toggleShuffle, cycleRepeat, toggleQueuePanel,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PlayerContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
