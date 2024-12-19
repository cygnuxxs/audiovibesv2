import { NextRequest } from "next/server";
import YouTube from "youtube-sr";
import { YouTubeAudioService } from "@/lib/services";
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const videoId = new URL(req.url).searchParams.get("id")?.trim();
    if (!videoId) {
      return YouTubeAudioService.createErrorResponse("Missing required parameter: id", 400);
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoDetails = await YouTube.getVideo(videoUrl);
    const title = videoDetails.title || "audio";

    return await YouTubeAudioService.streamAudio(videoUrl, title);
  } catch (error) {
    console.error("Request processing error:", error);
    return YouTubeAudioService.createErrorResponse("Failed to process the request", 500);
  }
}
