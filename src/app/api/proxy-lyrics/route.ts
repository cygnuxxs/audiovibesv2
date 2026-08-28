import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const trackName = req.nextUrl.searchParams.get("track_name");
    const artistName = req.nextUrl.searchParams.get("artist_name");

    if (!trackName) {
        return NextResponse.json({ error: "Missing track_name parameter" }, { status: 400 });
    }

    try {
        const params = new URLSearchParams({
            track_name: trackName,
            artist_name: artistName || "",
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

        const data = await res.json();
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (error) {
        console.error("Proxy lyrics error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
