import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "node-forge";
import {
  RawSearchResponseSchema,
  RawSuggestionEntrySchema,
  type Song,
  type RawSong,
} from "./schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeSongTitle(title: string): string {
  return title
    // Decode common HTML entities / encoded quotes
    .replace(/&quot;|quot/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")

    // Remove content inside brackets/parentheses
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\{[^}]*\}/g, " ")

    // Remove common music metadata descriptors
    .replace(
      /\b(official|official video|official audio|lyrics?|lyric video|audio|video|music video|visualizer|remastered|remaster|explicit|clean|version|edit|radio edit|extended|live|acoustic|instrumental|ost|original soundtrack|title track)\b/gi,
      " "
    )

    // Keep Unicode letters/numbers and spaces
    .replace(/[^\p{L}\p{N}\s]/gu, " ")

    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export function formatViews(views: number) {
  if (views < 1e3) return views.toString();
  if (views >= 1e3 && views < 1e5) return (views / 1e3).toFixed(1) + "K";
  if (views >= 1e5 && views < 1e7) return (views / 1e5).toFixed(1) + "L";
  if (views >= 1e7 && views < 1e10) return (views / 1e6).toFixed(1) + "M";
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

export function generateRandomId(length: number = 4): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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

export const createDownloadLink = (
  encryptedMediaUrl: string
): string => {
  if (!encryptedMediaUrl) return "";

  const maxQuality = { id: "_320", bitrate: "320kbps" };
  const key = "38346591";
  const iv = "00000000";

  const encrypted = crypto.util.decode64(encryptedMediaUrl);
  const decipher = crypto.cipher.createDecipher(
    "DES-ECB",
    crypto.util.createBuffer(key)
  );
  decipher.start({ iv: crypto.util.createBuffer(iv) });
  decipher.update(crypto.util.createBuffer(encrypted));
  decipher.finish();

  const decryptedLink = decipher.output.getBytes();

  // Replace the default _96 with _320 for max bitrate
  const maxBitrateUrl = decryptedLink.replace("_96", maxQuality.id);

  return maxBitrateUrl;
};

// ─── Raw JioSaavn → Domain Mappers (with Zod validation) ────────────────────

export const mapRawSongToSong = (raw: RawSong): Song => {
  const info = raw.more_info;
  const artistMap = info?.artistMap;

  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle ?? "",
    image: (raw.image as string).replace("150x150", "50x50"),
    language: raw.language ?? "",
    year: raw.year ?? "",
    downloadUrl: createDownloadLink(info?.encrypted_media_url ?? ""),
    play_count: raw.play_count ?? 0,
    explicit_content:
      typeof raw.explicit_content === "boolean"
        ? raw.explicit_content
        : undefined,
    music: info?.music ?? "",
    album: info?.album ?? "",
    label: info?.label ?? "",
    is320Kbps: info?.["320kbps"] === "true",
    encrypted_media_url: info?.encrypted_media_url ?? "",
    encrypted_drm_media_url: info?.encrypted_drm_media_url ?? "",
    album_url: info?.album_url ?? "",
    duration: info?.duration ?? "0",
    copyright_text: info?.copyright_text ?? "",
    release_date: info?.release_date ?? undefined,
    primary_artist_id: artistMap?.primary_artists?.[0]?.id,
    primary_artist_name: artistMap?.primary_artists?.[0]?.name,
    primary_artist_role: artistMap?.primary_artists?.[0]?.role ?? undefined,
    primary_artist_image: artistMap?.primary_artists?.[0]?.image ?? undefined,
    primary_artist_type: artistMap?.primary_artists?.[0]?.type ?? undefined,
    primary_artist_perma_url: artistMap?.primary_artists?.[0]?.perma_url ?? undefined,
    artists: artistMap?.artists?.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role ?? "",
      image: a.image ?? "",
      type: a.type ?? "",
      perma_url: a.perma_url ?? undefined,
    })),
  };
};

/**
 * Validates and transforms raw JioSaavn search response into Song[].
 * Throws ZodError if upstream shape is unexpected.
 */
export const flattenSongsData = (data: unknown): Song[] => {
  const parsed = RawSearchResponseSchema.parse(data);
  return parsed.results.map(mapRawSongToSong);
};

/**
 * Validates and transforms raw JioSaavn suggestions response into Song[].
 *
 * Response shape: { "0": { song: {...} }, "1": { song: {...} }, ..., "stationid": "..." }
 * Numeric keys hold song entries; non-numeric keys (stationid) are skipped.
 */
export const flattenSuggestionsData = (data: unknown): Song[] => {
  const record = data as Record<string, unknown>;
  return Object.keys(record)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((key) => {
      const entry = RawSuggestionEntrySchema.safeParse(record[key]);
      return entry.success ? [mapRawSongToSong(entry.data.song)] : [];
    });
};