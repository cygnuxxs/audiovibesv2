import { flattenSongsData } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// Interface for simplified query parameters
interface SearchQuery {
  query?: string; // Search term (e.g., telugu)
  type?: string; // Type of search (songs or albums)
  page?: string; // Page number
}

// API route handler
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const params: SearchQuery = {
    query: searchParams.get("query") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  };

  const { query, type, page } = params;

  // Validate query parameters
  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 }
    );
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
    __call:
      type.toLowerCase() === "songs"
        ? "search.getResults"
        : "search.getAlbumResults",
  };

  const externalApiUrl = `https://www.jiosaavn.com/api.php?p=${jioSaavnParams.p}&q=${jioSaavnParams.q}&_format=${jioSaavnParams._format}&_marker=${jioSaavnParams._marker}&api_version=${jioSaavnParams.api_version}&ctx=${jioSaavnParams.ctx}&n=${jioSaavnParams.n}&__call=${jioSaavnParams.__call}`;

  try {
    // Fetch data from JioSaavn API
    const response = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        Referer: "https://www.jiosaavn.com/",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch data from external API",
          message: response.statusText,
        },
        { status: response.status }
      );
    }

    const data: SearchSong = await response.json();
    const formattedData = flattenSongsData(data);
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching from JioSaavn API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
