import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const res = await fetch(url);
        if (!res.ok) {
            return new NextResponse(`Failed to fetch image: ${res.statusText}`, { status: res.status });
        }
        
        const buffer = await res.arrayBuffer();
        
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": res.headers.get("content-type") || "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Proxy image error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
