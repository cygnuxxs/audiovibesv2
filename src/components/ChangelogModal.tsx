"use client";

import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, ListMusic, Keyboard, X } from "lucide-react";
import { useIsMobile } from "@/components/hooks/useMobile";
import { cn } from "@/lib/utils"; // remove this import if you don't have a `cn` helper

const VERSION_KEY = "audiovibes_changelog_v2_1";
const VERSION_LABEL = "v2.1";

const FEATURES = [
  {
    icon: ListMusic,
    title: "Playback Queue",
    description: "Manage your next songs seamlessly with the new Queue Panel.",
  },
  {
    icon: Sparkles,
    title: "Auto Suggestions",
    description: "Smart song recommendations to keep the music playing endlessly.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description: "Control the PlayerBar instantly using built-in shortcuts for a faster UX.",
  },
  {
    icon: Download,
    title: "Native Downloads",
    description: "Replaced FFmpeg with a blazing-fast native MP4 worker for 320kbps downloads.",
  },
] as const;

export default function ChangelogModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Avoid a flash of the modal on first paint / SSR mismatch
  useEffect(() => {
    setMounted(true);
    const hasSeen = localStorage.getItem(VERSION_KEY);
    if (!hasSeen) {
      // Slight delay so it doesn't compete with the initial page render
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      localStorage.setItem(VERSION_KEY, "true");
    }
  };

  // Desktop-only: lock scroll, handle Escape, and focus the close button
  useEffect(() => {
    if (isMobile || !open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, open]);

  if (!mounted) return null;

  const featureList = (
    <ul className="space-y-1">
      {FEATURES.map(({ icon: Icon, title, description }, i) => (
        <li
          key={title}
          className="flex gap-3 items-start rounded-lg p-2.5 -mx-2.5 transition-colors hover:bg-muted/60 animate-in fade-in slide-in-from-bottom-1"
          style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards", animationDuration: "300ms" }}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </span>
          <div className="flex flex-col pt-1">
            <span className="font-medium text-foreground text-sm leading-none">{title}</span>
            <span className="text-muted-foreground text-sm mt-1.5 leading-snug">{description}</span>
          </div>
        </li>
      ))}
    </ul>
  );

  if (!isMobile) {
    if (!open) return null;
    return (
      <div
        role="presentation"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handleOpenChange(false);
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="changelog-title"
          aria-describedby="changelog-description"
          className="relative bg-popover text-popover-foreground rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => handleOpenChange(false)}
            aria-label="Close changelog"
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 pb-2 pr-12">
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 mb-2">
              {VERSION_LABEL}
            </span>
            <h2 id="changelog-title" className="text-lg font-semibold tracking-tight">
              What&apos;s New in AudioVibes
            </h2>
            <p id="changelog-description" className="text-sm text-muted-foreground mt-1">
              We&apos;ve added powerful features to level up your experience.
            </p>
          </div>

          <div className="px-6 py-3 max-h-[60vh] overflow-y-auto">{featureList}</div>

          <div className="p-6 pt-4 flex justify-end border-t border-border/60 mt-2">
            <Button variant="default" className="w-full" onClick={() => handleOpenChange(false)}>
              Got it!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <span className="inline-flex items-center self-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 mb-1">
              {VERSION_LABEL}
            </span>
            <DrawerTitle>What&apos;s New in AudioVibes</DrawerTitle>
            <DrawerDescription>
              We&apos;ve added powerful features to level up your experience.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 md:px-6 pb-2 max-h-[55vh] overflow-y-auto">{featureList}</div>

          <DrawerFooter className="mt-2">
            <DrawerClose
              className={cn(
                "bg-primary text-primary-foreground py-2.5 rounded-full font-medium",
                "transition-transform active:scale-[0.98]"
              )}
            >
              Got it!
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}