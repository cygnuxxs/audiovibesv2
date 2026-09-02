import { LyricsQuerySchema, LyricsResultSchema } from "@/lib/schemas";
import { z } from "zod/v4";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const result = LyricsQuerySchema.safeParse({
    track_name: req.nextUrl.searchParams.get("track_name") ?? undefined,
    artist_name: req.nextUrl.searchParams.get("artist_name") ?? undefined,
  });

  if (!result.success) {
    const firstIssue = result.error.issues[0]?.message ?? "Invalid parameters";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const { track_name, artist_name } = result.data;

  try {
    const params = new URLSearchParams({
      track_name,
      artist_name,
    });

    const res = await fetch(`https://lrclib.net/api/search?${params}`, {
      headers: {
        "User-Agent": "AudioVibes/1.0 (https://github.com/cygnuxxs)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `LRCLIB responded with ${res.status}` },
        { status: res.status }
      );
    }

    const raw = await res.json();
    const data = z.array(LyricsResultSchema).parse(raw);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Proxy lyrics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
