"use server";

import { redirect } from "next/navigation";


// Define constants for magic strings and configuration
const API_BASE_URL = process.env.SAAVN_API_URL || "https://saavn.dev/api";
const DEFAULT_QUERY = "telugu";
const SEARCH_LIMIT = 25;
const CACHE_REVALIDATION_TIME = 3600; // In seconds (1 hour)

export const searchSongs = async (searchQuery : string | undefined) => {
    const songName = searchQuery ? searchQuery : DEFAULT_QUERY

  const searchUrl = `${API_BASE_URL}/search/songs?query=${encodeURIComponent(songName)}&limit=${SEARCH_LIMIT}`;

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

    const result = await response.json();

    // Safely access the data and ensure we always return an array
    // The Saavn.dev API nests the results under `data.results` or `data.songs`
    const songs : Song[] = result?.data?.songs || result?.data?.results || [];
    return songs ;

  } catch (error) {
    // Catch fetch errors (e.g., network issues) or JSON parsing errors
    console.error("An error occurred in searchSongs:", error);
    
    // In production, you might want to return an empty array to prevent the page from crashing
    // while the error is logged for developers to see.
    return [];
  }
};

export async function setQuerySong(formData : FormData) {
  const songName = formData.get('song-name')
  if (songName) {
    redirect(`/?search=${encodeURIComponent(songName.toString())}`)
  }
}