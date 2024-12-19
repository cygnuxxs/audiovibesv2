"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import YouTube from "youtube-sr";
import { generateRandomId } from "./utils";

export const searchSongs = async () => {
  const cookieStore = await cookies();
  const songName = cookieStore.get("songName")?.value;
  if (!songName) {
    const results = await YouTube.search("#trendingmusic", {
      type: "video",
      limit: 25,
    });
    return results;
  }
  return await YouTube.search(songName, { type: "video", limit: 25 });
};

export const saveSongName = async (formData: FormData) => {
  const songName = formData.get("song-name")?.toString();
  const cookieStore = await cookies();
  cookieStore.set("id", generateRandomId());
  if (songName) {
    cookieStore.set("songName", songName, { maxAge: 2 });
  }
  revalidatePath("/");
};