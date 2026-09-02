import { useFetch } from "@/components/hooks/useFetch";
import type { APIParams, RawSongSchema, Song } from "@/lib/schemas";
import { mapRawSongToSong } from "@/lib/utils";
import { z } from "zod/v4";

// ─── Endpoint Identifiers ────────────────────────────────────────────────────

const endpoints = {
  createStation: "webradio.createEntityStation",
  songSuggestions: "webradio.getSong",
  searchSongs: "search.getResults",
  searchAlbums: "search.getAlbumResults",
  trending: "content.getTrending",
} as const;

// ─── Shared Constants ────────────────────────────────────────────────────────

export const JIOSAAVN_API = "https://www.jiosaavn.com/api.php";

export const HEADERS = {
  Accept: "application/json, text/javascript, */*; q=0.01",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  Referer: "https://www.jiosaavn.com/",
};

// ─── Base Params ─────────────────────────────────────────────────────────────

const baseParams: Omit<APIParams, "__call"> = {
  _format: "json",
  _marker: "0",
  api_version: "4",
  ctx: "android",
};

// ─── Param Builders ──────────────────────────────────────────────────────────

export const getSearchParams = (
  query: string,
  type?: "songs" | "albums",
  n?: number,
  page?: number
): URLSearchParams => {
  const params: Record<string, string> = {
    ...baseParams,
    __call:
      type?.toLowerCase() === "albums"
        ? endpoints.searchAlbums
        : endpoints.searchSongs,
    ctx: "web6dot0",
    n: n ? n.toString() : "50",
    p: page ? page.toString() : "1",
    q: query,
  };
  return new URLSearchParams(params);
};

export const getStationParams = (songId: string): URLSearchParams => {
  const encodedId = JSON.stringify([songId]);
  const params: Record<string, string> = {
    ...baseParams,
    __call: endpoints.createStation,
    entity_type: "queue",
    entity_id: encodedId,
  };
  return new URLSearchParams(params);
};

export const getSuggestionsParams = (
  stationId: string,
  limit: number
): URLSearchParams => {
  const params: Record<string, string> = {
    ...baseParams,
    __call: endpoints.songSuggestions,
    k: limit.toString(),
    next: "1",
    stationid: stationId,
  };
  return new URLSearchParams(params);
};

export const interleaveFeedSongs = (lists: Song[][], limit: number): Song[] => {
  const seen = new Set<string>()
  const merged: Song[] = []
  const longest = Math.max(0, ...lists.map((list) => list.length))

  for (let index = 0; index < longest && merged.length < limit; index++) {
    for (const list of lists) {
      if (merged.length >= limit) break

      const song = list[index]
      if (!song || seen.has(song.id)) continue

      seen.add(song.id)
      merged.push(song)
    }
  }

  return merged
}
