import { z } from "zod/v4";

// ─── Domain Schemas ──────────────────────────────────────────────────────────

export const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullish().default(""),
  image: z.string().nullish().default(""),
  type: z.string().nullish().default(""),
  perma_url: z.string().nullish(),
});

export const SongSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  image: z.string(),
  language: z.string(),
  year: z.string(),
  downloadUrl: z.string(),
  play_count: z.number(),
  music: z.string(),
  album: z.string(),
  label: z.string(),
  is320Kbps: z.boolean(),
  encrypted_media_url: z.string(),
  encrypted_drm_media_url: z.string(),
  album_url: z.string(),
  duration: z.string(),
  copyright_text: z.string(),
  release_date: z.string().nullish(),
  explicit_content: z.boolean().nullish(),
  primary_artist_id: z.string().nullish(),
  primary_artist_name: z.string().nullish(),
  primary_artist_role: z.string().nullish(),
  primary_artist_image: z.string().nullish(),
  primary_artist_type: z.string().nullish(),
  primary_artist_perma_url: z.string().nullish(),
  artists: z.array(ArtistSchema).nullish(),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type Song = z.infer<typeof SongSchema>;
export type Artist = z.infer<typeof ArtistSchema>;

// ─── Raw JioSaavn Response Schemas (for validation at API boundary) ──────────

/** Raw artist entry in JioSaavn artistMap */
const RawArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullish(),
  image: z.string().nullish(),
  type: z.string().nullish(),
  perma_url: z.string().nullish(),
});

/** Raw song object returned by JioSaavn search/trending */
export const RawSongSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullish().default(""),
  image: z.string(),
  language: z.string().nullish().default(""),
  year: z.string().nullish().default(""),
  play_count: z.coerce.number().nullish().default(0),
  explicit_content: z.union([z.boolean(), z.string()]).nullish(),
  more_info: z
    .object({
      music: z.string().nullish().default(""),
      album: z.string().nullish().default(""),
      label: z.string().nullish().default(""),
      "320kbps": z.string().nullish(),
      encrypted_media_url: z.string().nullish().default(""),
      encrypted_drm_media_url: z.string().nullish().default(""),
      album_url: z.string().nullish().default(""),
      duration: z.string().nullish().default("0"),
      copyright_text: z.string().nullish().default(""),
      release_date: z.string().nullish(),
      artistMap: z
        .object({
          primary_artists: z.array(RawArtistSchema).nullish(),
          artists: z.array(RawArtistSchema).nullish(),
        })
        .nullish(),
    })
    .nullish(),
});

export type RawSong = z.infer<typeof RawSongSchema>;

/** JioSaavn search endpoint response */
export const RawSearchResponseSchema = z.object({
  results: z.array(RawSongSchema),
});

/** JioSaavn station creation response */
export const StationResponseSchema = z.object({
  stationid: z.string(),
  status: z.string().optional(),
  message: z.string().optional(),
});

/**
 * JioSaavn suggestions response.
 * Shape: { "0": { song: {...} }, "1": { song: {...} }, ..., "stationid": "..." }
 * Numeric keys hold song entries; non-numeric keys are metadata.
 */
export const RawSuggestionEntrySchema = z.object({
  song: RawSongSchema,
});

// ─── API Query Param Schemas ─────────────────────────────────────────────────

export const SearchQuerySchema = z.object({
  query: z.string().min(1, "Missing query parameter"),
  type: z.enum(["songs", "albums"]).optional().default("songs"),
  page: z.coerce.number().int().positive().optional().default(1),
});

export const SuggestionsQuerySchema = z.object({
  id: z.string().min(1, "Missing 'id' query parameter (song ID required)"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const TrendingQuerySchema = z.object({
  languages: z.string().min(1, "Missing 'languages' query parameter"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const ProxyUrlQuerySchema = z.object({
  url: z.url("Missing or invalid url parameter"),
});

export const LyricsQuerySchema = z.object({
  track_name: z.string().min(1, "Missing track_name parameter"),
  artist_name: z.string().optional().default(""),
});

/** LRCLIB search result entry */
export const LyricsResultSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  trackName: z.string().optional(),
  artistName: z.string().optional(),
  albumName: z.string().optional(),
  duration: z.number().optional(),
  instrumental: z.boolean().optional(),
  plainLyrics: z.string().nullable().optional(),
  syncedLyrics: z.string().nullable().optional(),
});

// ─── API Error Response ──────────────────────────────────────────────────────

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
});

// ─── API Param Types (for endpoints.ts builders) ─────────────────────────────

export const APIParamsSchema = z.object({
  __call: z.string(),
  _format: z.literal("json"),
  ctx: z.enum(["web6dot0", "android"]),
  api_version: z.literal("4"),
  _marker: z.literal("0"),
});

export type APIParams = z.infer<typeof APIParamsSchema>;
