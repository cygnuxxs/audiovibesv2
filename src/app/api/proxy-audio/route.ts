import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const res = await fetch(url);
        if (!res.ok) {
            return new NextResponse(`Failed to fetch audio: ${res.statusText}`, { status: res.status });
        }

        const contentLength = res.headers.get("content-length");
        const contentType = res.headers.get("content-type") || "audio/mp4";

        const headers: Record<string, string> = {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
        };

        if (contentLength) {
            headers["Content-Length"] = contentLength;
        }

        // Stream response body directly to avoid buffering large audio files in memory
        return new NextResponse(res.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Proxy audio error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
