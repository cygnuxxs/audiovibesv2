import { flattenSuggestionsData } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const JIOSAAVN_API = "https://www.jiosaavn.com/api.php";

const HEADERS = {
  Accept: "application/json, text/javascript, */*; q=0.01",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  Referer: "https://www.jiosaavn.com/",
};

async function createStation(songId: string): Promise<string> {
  // Don't encodeURIComponent here — URLSearchParams already encodes the
  // full value, so doing it twice mangles songIds with special characters.
  const encodedId = JSON.stringify([songId]);

  const params = new URLSearchParams({
    __call: "webradio.createEntityStation",
    entity_id: encodedId,
    _format: "json",
    entity_type: "queue",
    ctx: "android",
    api_version: "4",
    _marker: "0",
  });

  const response = await fetch(`${JIOSAAVN_API}?${params}`, {
    headers: HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Station creation failed: ${response.status}`);
  }
  const data = await response.json();
  if (data.status === "error" || !data.stationid) {
    throw new Error(data.message ?? "No station ID returned from JioSaavn");
  }

  return data.stationid;
}

async function fetchSuggestions(stationId: string, limit: number): Promise<any> {
  const params = new URLSearchParams({
    __call: "webradio.getSong",
    stationid: stationId,
    k: limit.toString(),
    ctx: "android",
    api_version: "4",
    _format: "json",
    _marker: "0",
    next: "1",
  });

  const response = await fetch(`${JIOSAAVN_API}?${params}`, {
    headers: HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Suggestion fetch failed: ${response.status}`);
  }

  return response.json();
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const songId = searchParams.get("id");

  if (!songId) {
    return NextResponse.json(
      { error: "Missing 'id' query parameter (song ID required)" },
      { status: 400 }
    );
  }

  const rawLimit = parseInt(searchParams.get("limit") ?? "10", 10);
  const limit = Number.isNaN(rawLimit) ? 10 : Math.max(1, Math.min(rawLimit, 50));

  try {
    const stationId = await createStation(songId);
    const rawData = await fetchSuggestions(stationId, limit);
    const songsData = flattenSuggestionsData(rawData)
    return NextResponse.json(songsData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching song suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch song suggestions" },
      { status: 500 }
    );
  }
}
