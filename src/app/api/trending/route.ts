import { mapRawSongToSong } from "@/lib/utils";
import { RawSongSchema, TrendingQuerySchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";
import { useFetch } from "@/components/hooks/useFetch";
import { interleaveFeedSongs } from "../endpoints";
import type { Song } from "@/lib/schemas";
import { z } from "zod/v4";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function fetchLanguage(language: string): Promise<Song[]> {
    const { data, ok } = await useFetch<z.infer<typeof RawSongSchema>[]>({
        endpoint: "content.getTrending",
        params: {
            entity_type: "song",
            entity_language: language,
        },
    });

    if (!ok || !Array.isArray(data)) return [];
    const parsed = z.array(RawSongSchema).safeParse(data);
    if (!parsed.success) return [];

    return parsed.data
        .filter((song) => song.id && song.more_info?.encrypted_media_url)
        .map(mapRawSongToSong);
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    const result = TrendingQuerySchema.safeParse({
        languages: searchParams.get("languages") ?? "telugu,english",
        limit: searchParams.get("limit") ?? 50,
    });

    if (!result.success) {
        const firstIssue = result.error.issues[0]?.message ?? "Invalid parameters";
        return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const { languages, limit } = result.data;
    const languageList = languages.split(",").map((l) => l.trim()).filter(Boolean);

    if (languageList.length === 0) {
        return NextResponse.json(
            { error: "No valid languages provided" },
            { status: 400 }
        );
    }

    try {
        const results = await Promise.all(languageList.map(fetchLanguage));
        const songs = interleaveFeedSongs(results, limit);

        return NextResponse.json(songs, {
            headers: {
                "Cache-Control":
                    "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("Error fetching trending songs:", error);
        return NextResponse.json(
            { error: "Failed to fetch trending songs" },
            { status: 500 }
        );
    }
}
