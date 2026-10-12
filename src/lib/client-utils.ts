import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeSongTitle(title: string): string {
  return title
    .replace(/&quot;|quot/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(
      /\b(official|official video|official audio|lyrics?|lyric video|audio|video|music video|visualizer|remastered|remaster|explicit|clean|version|edit|radio edit|extended|live|acoustic|instrumental|ost|original soundtrack|title track)\b/gi,
      " "
    )
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatViews(views: number) {
  if (views < 1e3) return views.toString();
  if (views < 1e5) return (views / 1e3).toFixed(1) + "K";
  if (views < 1e7) return (views / 1e5).toFixed(1) + "L";
  if (views < 1e10) return (views / 1e6).toFixed(1) + "M";
  return (views / 1e7).toFixed(1) + "Cr";
}

export const formatDuration = (
  totalSeconds: number | null | undefined
): string => {
  if (
    typeof totalSeconds !== "number" ||
    totalSeconds < 0 ||
    !isFinite(totalSeconds)
  ) {
    return "0m 0s";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};
