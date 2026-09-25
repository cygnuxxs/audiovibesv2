import { ProxyUrlQuerySchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const result = ProxyUrlQuerySchema.safeParse({
    url: req.nextUrl.searchParams.get("url") ?? undefined,
  });

  if (!result.success) {
    return new NextResponse("Missing or invalid url parameter", {
      status: 400,
    });
  }

  try {
    const res = await fetch(result.data.url);
    if (!res.ok) {
      return new NextResponse(
        `Failed to fetch audio: ${res.statusText}`,
        { status: res.status }
      );
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
