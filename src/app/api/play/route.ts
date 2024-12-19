import { NextRequest } from "next/server";
import YouTube from "youtube-sr";
import { YouTubeAudioService } from "@/lib/services";
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const videoId = new URL(req.url).searchParams.get("id")?.trim();
    const videoTitle = req.nextUrl.searchParams.get('title')?.trim() || 'audio';
    if (!videoId) {
      return YouTubeAudioService.createErrorResponse("Missing required parameter: id", 400);
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return await YouTubeAudioService.streamAudio(videoUrl, videoTitle);
  } catch (error) {
    console.error("Request processing error:", error);
    return YouTubeAudioService.createErrorResponse("Failed to process the request", 500);
  }
}
