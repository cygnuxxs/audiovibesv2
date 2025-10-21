"use server";

import { supabase } from "@/lib/supabase";

// Define constants for magic strings and configuration
const DEFAULT_QUERY = "telugu songs";
const SEARCH_LIMIT = 25;
const CACHE_REVALIDATION_TIME = 3600; // In seconds (1 hour)

export const searchSongs = async (searchQuery : string | undefined) => {
    const songName = searchQuery ? searchQuery : DEFAULT_QUERY

const searchUrl = `${process.env.PUBLIC_URL}/api/search?query=${encodeURIComponent(songName)}&limit=${SEARCH_LIMIT}&type=songs`;
  
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

    const songs : Song[] = await response.json();
    return songs

  } catch (error) {
    // Catch fetch errors (e.g., network issues) or JSON parsing errors
    console.error("An error occurred in searchSongs:", error);
    
    // In production, you might want to return an empty array to prevent the page from crashing
    // while the error is logged for developers to see.
    return [];
  }
};
export async function incrementDownloads() {
  const { data } = await supabase
    .from("downloads")
    .select("id, count")
    .limit(1)
    .single();
  if (!data) {
    // Create one if doesn't exist
    const { data: created } = await supabase
      .from("downloads")
      .insert({ count: 1 })
      .select()
      .single();
    return created;
  }

  // Increment count
  const { data: updated } = await supabase
    .from("downloads")
    .update({ count: data.count + 1 })
    .eq("id", data.id)
    .select()
    .single();

  return updated;
}
