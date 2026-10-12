'use client';
import Image from 'next/image';
import { decode } from 'he';
import { usePlayer } from '@/lib/player';
import { X, Trash2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/client-utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/components/hooks/useMobile'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function QueuePanel() {
  const player = usePlayer();
  const isMobile = useIsMobile()
  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"} showSwipeHandle={isMobile} open={player.isQueueOpen} onOpenChange={(open) => { if (!open) player.toggleQueuePanel(); }}>
      <DrawerContent>
        {/* Header */}
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DrawerTitle className="text-sm font-bold">Queue</DrawerTitle>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-mono">
                {player.queue.length}
              </span>
            </div>
            {player.queue.length > 0 && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={player.clearQueue}
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label="Clear queue"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Clear all</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <DrawerDescription className="sr-only">
            Manage your playback queue
          </DrawerDescription>
        </DrawerHeader>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {player.queue.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Queue is empty
            </div>
          ) : (
            <div className="py-1">
              {player.queue.map((song, index) => {
                const isCurrent = index === player.queueIndex;
                return (
                  <div
                    key={`${song.id}-${index}`}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors group',
                      isCurrent && 'bg-primary/5'
                    )}
                  >
                    {/* Index / playing indicator */}
                    <div className="w-5 text-center shrink-0">
                      {isCurrent && player.isPlaying ? (
                        <div className="flex items-center justify-center gap-px h-4">
                          <span className="w-0.5 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <span className={cn(
                          'text-[11px] font-mono',
                          isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                        )}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Artwork */}
                    <div className="relative size-10 shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={song.image.replace('50x50', '150x150')}
                        fill
                        alt={decode(song.title)}
                        className="object-cover"
                        sizes="40px"
                        loading="lazy"
                      />
                      {/* Play overlay on hover */}
                      <button
                        onClick={() => {
                          if (isCurrent) {
                            player.togglePlayback();
                          } else {
                            player.play(song, player.queue);
                          }
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={isCurrent && player.isPlaying ? 'Pause' : 'Play'}
                      >
                        {isCurrent && player.isPlaying ? (
                          <Pause className="size-4 text-white" fill="white" />
                        ) : (
                          <Play className="size-4 text-white ml-0.5" fill="white" />
                        )}
                      </button>
                    </div>

                    {/* Song info */}
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        'text-sm font-semibold truncate',
                        isCurrent && 'text-primary'
                      )}>
                        {decode(song.title)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {song.primary_artist_name || song.subtitle}
                      </p>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => player.removeFromQueue(index)}
                      className="size-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      aria-label={`Remove ${decode(song.title)} from queue`}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard hint footer */}
        <div className="flex flex-col border-t border-border shrink-0 bg-muted/30">
          <Link
            href="/contribute"
            className="flex items-center justify-between p-3 hover:bg-muted transition-colors group"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold group-hover:text-primary transition-colors">
                Support AudioVibes
              </span>
              <span className="text-[10px] text-muted-foreground">
                Buy us a coffee
              </span>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Contribute
            </span>
          </Link>
          <div className="hidden sm:flex items-center justify-center py-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground">
              Press{' '}
              <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono border border-border">
                Q
              </kbd>{' '}
              to toggle
            </span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
