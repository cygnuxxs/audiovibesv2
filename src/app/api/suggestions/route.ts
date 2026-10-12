import { flattenSuggestionsData } from "@/lib/utils";
import {
  SuggestionsQuerySchema,
  StationResponseSchema,
} from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";
import {
  getStationParams,
  getSuggestionsParams,
  HEADERS,
  JIOSAAVN_API,
} from "../endpoints";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function createStation(songId: string): Promise<string> {
  const params = getStationParams(songId);

  const response = await fetch(`${JIOSAAVN_API}?${params}`, {
    headers: HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Station creation failed: ${response.status}`);
  }

  const data = await response.json();
  const parsed = StationResponseSchema.safeParse(data);

  if (!parsed.success || parsed.data.status === "error" || !parsed.data.stationid) {
    const message =
      parsed.success && parsed.data.message
        ? parsed.data.message
        : "No station ID returned from JioSaavn";
    throw new Error(message);
  }

  return parsed.data.stationid;
}

async function fetchSuggestions(
  stationId: string,
  limit: number
): Promise<unknown> {
  const params = getSuggestionsParams(stationId, limit);

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

  const result = SuggestionsQuerySchema.safeParse({
    id: searchParams.get("id") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!result.success) {
    const firstIssue = result.error.issues[0]?.message ?? "Invalid parameters";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const { id, limit } = result.data;

  try {
    const stationId = await createStation(id);
    const rawData = await fetchSuggestions(stationId, limit);
    const songsData = flattenSuggestionsData(rawData);
    return NextResponse.json(songsData, {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
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
