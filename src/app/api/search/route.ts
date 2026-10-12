import { flattenSongsData } from "@/lib/utils";
import { SearchQuerySchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";
import { getSearchParams, HEADERS, JIOSAAVN_API } from "../endpoints";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const result = SearchQuerySchema.safeParse({
    query: searchParams.get("query") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  });

  if (!result.success) {
    const firstIssue = result.error.issues[0]?.message ?? "Invalid parameters";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const { query, type, page } = result.data;

  try {
    const params = getSearchParams(query, type, undefined, page);
    const response = await fetch(`${JIOSAAVN_API}?${params}`, {
      method: "GET",
      headers: HEADERS,
      cache: "no-store",
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

    const data = await response.json();
    const formattedData = flattenSongsData(data);

    return NextResponse.json(formattedData, {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching from JioSaavn API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
