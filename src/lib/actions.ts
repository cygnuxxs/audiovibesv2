"use server";

import { z } from "zod/v4";
import { SongSchema, type Song } from "./schemas";

const DEFAULT_QUERY = "telugu";
const SEARCH_LIMIT = 25;
const CACHE_REVALIDATION_TIME = 3600; // In seconds (1 hour)

export const searchSongs = async (searchQuery: string | undefined): Promise<Song[]> => {
  const languages = ['telugu', 'english'].join(',');
  const searchUrl = searchQuery
    ? `${process.env.PUBLIC_URL}/api/search?query=${encodeURIComponent(searchQuery)}&limit=${SEARCH_LIMIT}&type=songs`
    : `${process.env.PUBLIC_URL}/api/trending?limit=${SEARCH_LIMIT}&languages=${languages}`;

  try {
    const response = await fetch(searchUrl, {
      // Next.js specific caching strategy
      next: {
        revalidate: CACHE_REVALIDATION_TIME, // Cache results for 1 hour
      },
    });

    if (!response.ok) {
      // Provide more context in the error for easier debugging
      throw new Error(`Failed to fetch songs. Status: ${response.status} ${response.statusText}`);
    }

    const raw = await response.json();
    const songs = z.array(SongSchema).parse(raw);
    return songs;

  } catch (error) {
    // Catch fetch errors (e.g., network issues) or JSON parsing errors
    console.error("An error occurred in searchSongs:", error);

    // In production, you might want to return an empty array to prevent the page from crashing
    // while the error is logged for developers to see.
    return [];
  }
};
