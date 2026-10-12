'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { decode } from 'he';
import { usePlayer } from '@/lib/player';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Loader2,
  ChevronDown,
  Download,
  Coffee,
} from 'lucide-react';
import { cn } from '@/lib/client-utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import QueuePanel from './QueuePanel';
import useDownloadAudio from './hooks/useDownloadAudio';

// ── Format time ──

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Progress Bar (using shadcn Slider) ──

function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) {
  const handleValueChange = useCallback(
    (value: number[]) => {
      if (duration > 0) {
        onSeek(value[0]);
      }
    },
    [duration, onSeek]
  );

  return (
    <div className="flex items-center gap-2.5 w-full group/progress">
      <span className="text-[10px] font-mono text-muted-foreground min-w-8 text-right tabular-nums">
        {formatTime(currentTime)}
      </span>
      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 1}
        step={0.1}
        onValueChange={handleValueChange}
        className="flex-1 cursor-pointer"
        aria-label="Seek"
      />
      <span className="text-[10px] font-mono text-muted-foreground min-w-8 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
}

// ── Volume Slider (using shadcn Slider + Button) ──

function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}) {
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="relative flex items-center group/volume">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        className="size-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="size-5" />
      </Button>

      {/* Vertical Slider Flyout */}
      <div className="absolute bottom-[calc(100%-12px)] left-1/2 -translate-x-1/2 pb-4 w-12 flex flex-col items-center justify-end z-50 pointer-events-none group-hover/volume:pointer-events-auto group-focus-within/volume:pointer-events-auto">
        <div className="h-0 opacity-0 overflow-hidden flex flex-col items-center justify-center bg-popover/90 backdrop-blur-md border border-border rounded-full shadow-lg group-hover/volume:h-32 group-hover/volume:opacity-100 group-focus-within/volume:h-32 group-focus-within/volume:opacity-100 transition-all duration-300 ease-out origin-bottom group-hover/volume:py-4 group-focus-within/volume:py-4 w-full">
          <Slider
            orientation="vertical"
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => onVolumeChange(v[0])}
            className="h-full w-full cursor-pointer hover:scale-x-110 transition-transform"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

// ── Tooltip Button helper ──

function PlayerButton({
  onClick,
  disabled,
  label,
  shortcut,
  variant = 'ghost',
  size = 'icon',
  className,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  shortcut?: string;
  variant?: 'ghost' | 'default' | 'secondary' | 'outline';
  size?: 'icon' | 'sm' | 'default';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={onClick}
            disabled={disabled}
            className={className}
            aria-label={label}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>
            {label}
            {shortcut && (
              <kbd className="ml-1.5 px-1 py-0.5 bg-primary-foreground/20 rounded text-[10px] font-mono">
                {shortcut}
              </kbd>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Mobile Expanded Player ──

function MobileExpandedPlayer({
  onCollapse,
  downloadAudio,
}: {
  onCollapse: () => void;
  downloadAudio: ReturnType<typeof useDownloadAudio>;
}) {
  const player = usePlayer();
  const { currentSong } = player;
  if (!currentSong) return null;

  const highResImage = currentSong.image.replace('50x50', '500x500');

  return (
    <div className="fixed inset-0 z-60 bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          aria-label="Collapse player"
        >
          <ChevronDown className="size-6" />
        </Button>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Now Playing
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={player.toggleQueuePanel}
          className={cn(player.isQueueOpen && 'text-primary')}
          aria-label="Queue"
        >
          <ListMusic className="size-5" />
        </Button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-8 py-4">
        <div className="relative w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src={highResImage}
            fill
            alt={decode(currentSong.title)}
            className="object-cover"
            sizes="320px"
            priority
          />
        </div>
      </div>

      {/* Song Info */}
      <div className="px-8 pb-2 text-center">
        <h3 className="text-lg font-bold truncate">{decode(currentSong.title)}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {currentSong.primary_artist_name || currentSong.subtitle}
        </p>
      </div>

      {/* Progress */}
      <div className="px-8 pb-4">
        <ProgressBar
          currentTime={player.currentTime}
          duration={player.duration}
          onSeek={player.seek}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={player.toggleShuffle}
          className={cn(
            'size-10',
            player.isShuffled ? 'text-primary' : 'text-muted-foreground'
          )}
          aria-label="Shuffle"
        >
          <Shuffle className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={player.prev}
          className="size-10"
          aria-label="Previous"
        >
          <SkipBack className="size-6" fill="currentColor" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={player.togglePlayback}
          disabled={player.isLoadingSong}
          className="size-14 rounded-full shadow-lg"
          aria-label={player.isPlaying ? 'Pause' : 'Play'}
        >
          {player.isLoadingSong ? (
            <Loader2 className="size-7 animate-spin" />
          ) : player.isPlaying ? (
            <Pause className="size-7" fill="currentColor" />
          ) : (
            <Play className="size-7 ml-0.5" fill="currentColor" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={player.next}
          className="size-10"
          aria-label="Next"
        >
          <SkipForward className="size-6" fill="currentColor" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={player.cycleRepeat}
          className={cn(
            'size-10',
            player.repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'
          )}
          aria-label="Repeat"
        >
          {player.repeatMode === 'one' ? (
            <Repeat1 className="size-5" />
          ) : (
            <Repeat className="size-5" />
          )}
        </Button>
      </div>

      {/* Volume & Misc Controls */}
      <div className="flex items-center justify-between pb-8 px-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={downloadAudio.handleDownload}
          disabled={downloadAudio.isProcessingDownload}
          className="size-10 text-muted-foreground hover:text-foreground"
          aria-label="Download"
        >
          {downloadAudio.isProcessingDownload ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Download className="size-5" />
          )}
        </Button>
        <div className="flex-1 flex justify-center">
          <VolumeControl
            volume={player.volume}
            isMuted={player.isMuted}
            onVolumeChange={player.setVolume}
            onToggleMute={player.toggleMute}
          />
        </div>
        <div className="size-10" />
      </div>
    </div>
  );
}

// ── Main PlayerBar ──

export default function PlayerBar() {
  const player = usePlayer();
  const { currentSong } = player;
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const downloadAudio = useDownloadAudio(currentSong);

  if (!currentSong) return null;

  const lowResImage = currentSong.image;
  const medResImage = currentSong.image.replace('50x50', '150x150');

  if (mobileExpanded) {
    return (
      <>
        <MobileExpandedPlayer onCollapse={() => setMobileExpanded(false)} downloadAudio={downloadAudio} />
        <QueuePanel />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background/40 backdrop-blur-xs border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.15)]',
          'animate-in slide-in-from-bottom-full duration-300'
        )}
      >
        {/* Mobile compact progress bar on top edge */}
        <div className="sm:hidden h-0.5 bg-muted relative">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-200"
            style={{ width: `${player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5">
          {/* Song info — clickable on mobile to expand */}
          <button
            className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none sm:w-56 text-left sm:pointer-events-none"
            onClick={() => setMobileExpanded(true)}
            aria-label="Expand player"
          >
            <div className="relative size-10 sm:size-11 shrink-0 rounded-lg overflow-hidden shadow-md">
              <Image
                src={medResImage}
                fill
                alt={decode(currentSong.title)}
                className="object-cover"
                sizes="44px"
                placeholder="blur"
                blurDataURL={lowResImage}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{decode(currentSong.title)}</p>
              <p className="text-xs font-semibold text-foreground/80">
                {currentSong.primary_artist_name || currentSong.subtitle}
              </p>
            </div>
          </button>

          {/* Center controls — hidden on mobile */}
          <div className="hidden sm:flex flex-col items-center flex-1 gap-1 max-w-xl">
            <div className="flex items-center gap-1">
              <PlayerButton
                onClick={player.toggleShuffle}
                label="Shuffle"
                shortcut="S"
                className={cn(
                  'size-8',
                  player.isShuffled ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Shuffle className="size-3.5" />
              </PlayerButton>

              <PlayerButton
                onClick={player.prev}
                label="Previous"
                shortcut="P"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <SkipBack className="size-4" fill="currentColor" />
              </PlayerButton>

              <PlayerButton
                onClick={player.togglePlayback}
                disabled={player.isLoadingSong}
                label={player.isPlaying ? 'Pause' : 'Play'}
                shortcut="Space"
                variant="default"
                className="size-9 rounded-full shadow-sm"
              >
                {player.isLoadingSong ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : player.isPlaying ? (
                  <Pause className="size-4" fill="currentColor" />
                ) : (
                  <Play className="size-4 ml-0.5" fill="currentColor" />
                )}
              </PlayerButton>

              <PlayerButton
                onClick={player.next}
                label="Next"
                shortcut="N"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="size-4" fill="currentColor" />
              </PlayerButton>

              <PlayerButton
                onClick={player.cycleRepeat}
                label={`Repeat ${player.repeatMode}`}
                shortcut="R"
                className={cn(
                  'size-8',
                  player.repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {player.repeatMode === 'one' ? (
                  <Repeat1 className="size-3.5" />
                ) : (
                  <Repeat className="size-3.5" />
                )}
              </PlayerButton>
            </div>
            <ProgressBar
              currentTime={player.currentTime}
              duration={player.duration}
              onSeek={player.seek}
            />
          </div>

          {/* Right: volume + queue */}
          <div className="flex items-center gap-0.5 sm:w-44 justify-end">
            {/* Mobile play/pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={player.togglePlayback}
              disabled={player.isLoadingSong}
              className="sm:hidden size-9"
              aria-label={player.isPlaying ? 'Pause' : 'Play'}
            >
              {player.isLoadingSong ? (
                <Loader2 className="size-5 animate-spin" />
              ) : player.isPlaying ? (
                <Pause className="size-5" fill="currentColor" />
              ) : (
                <Play className="size-5 ml-0.5" fill="currentColor" />
              )}
            </Button>
            {/* Mobile next */}
            <Button
              variant="ghost"
              size="icon"
              onClick={player.next}
              className="sm:hidden size-8 text-muted-foreground"
              aria-label="Next"
            >
              <SkipForward className="size-4" fill="currentColor" />
            </Button>

            <div className="hidden sm:flex items-center">
              <VolumeControl
                volume={player.volume}
                isMuted={player.isMuted}
                onVolumeChange={player.setVolume}
                onToggleMute={player.toggleMute}
              />
            </div>

            <PlayerButton
              onClick={downloadAudio.handleDownload}
              disabled={downloadAudio.isProcessingDownload}
              label="Download"
              className="hidden sm:flex size-8 text-muted-foreground hover:text-foreground"
            >
              {downloadAudio.isProcessingDownload ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </PlayerButton>

            <PlayerButton
              onClick={player.toggleQueuePanel}
              label="Queue"
              shortcut="Q"
              className={cn(
                'size-8',
                player.isQueueOpen ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <ListMusic className="size-4" />
            </PlayerButton>

            <Link href="/contribute">
              <PlayerButton
                onClick={() => { }}
                label="Buy us a coffee"
                className="hidden sm:flex size-8 text-muted-foreground"
              >
                <Coffee className="size-4" />
              </PlayerButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Queue panel */}
      <QueuePanel />
    </>
  );
}
