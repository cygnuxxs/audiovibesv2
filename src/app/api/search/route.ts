import { flattenSongsData } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// 1. Force the route to be dynamic so Next.js doesn't cache the output
export const dynamic = "force-dynamic";

interface SearchQuery {
  query?: string;
  type?: string;
  page?: string;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const params: SearchQuery = {
    query: searchParams.get("query") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  };

  const { query, type, page } = params;

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }
  if (!type || !["songs", "albums"].includes(type.toLowerCase())) {
    return NextResponse.json(
      { error: 'Invalid type parameter. Must be "songs" or "albums"' },
      { status: 400 }
    );
  }

  const jioSaavnParams = {
    p: page || "1",
    q: query,
    _format: "json",
    _marker: "0",
    api_version: "4",
    ctx: "web6dot0",
    n: "20",
    __call: type.toLowerCase() === "songs" ? "search.getResults" : "search.getAlbumResults",
  };

  const externalApiUrl = `https://www.jiosaavn.com/api.php?p=${jioSaavnParams.p}&q=${jioSaavnParams.q}&_format=${jioSaavnParams._format}&_marker=${jioSaavnParams._marker}&api_version=${jioSaavnParams.api_version}&ctx=${jioSaavnParams.ctx}&n=${jioSaavnParams.n}&__call=${jioSaavnParams.__call}`;

  try {
    // 2. Use cache: 'no-store' to ensure a fresh fetch every time
    const response = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        Referer: "https://www.jiosaavn.com/",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from external API", message: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const formattedData = flattenSongsData(data);

    // 3. Set Cache-Control headers to prevent browser/proxy caching
    return NextResponse.json(formattedData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error fetching from JioSaavn API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
