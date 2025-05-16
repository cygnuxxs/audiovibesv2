
import { NextRequest } from "next/server";
import ytdl from "@distube/ytdl-core";

import { Agent } from 'https';

// Create a custom agent with browser-like headers
const agent = new Agent({
  keepAlive: true,
});

// Utility to enhance request options
const getRequestOptions = () => ({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.youtube.com/',
  },
  agent,
});

// Constants
const AUDIO_QUALITY = "highestaudio";
const MAX_VIDEO_LENGTH = 3600; // 1 hour in seconds


// Utility functions
const sanitizeTitle = (title: string): string => {
  return title.replace(/[^\w\s-]/g, '').trim() || "audio";
};

const createHeaders = (title: string): Headers => {
  return new Headers({
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(title)}.opus`,
    "Content-Type": "audio/opus",
    "Song-Title": title,
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
};

const validateVideoId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
};

const validateVideoLength = (lengthSeconds: string): void => {
  if (parseInt(lengthSeconds) > MAX_VIDEO_LENGTH) {
    throw new Error("Video duration exceeds maximum allowed length of 1 hour");
  }
};

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id || !validateVideoId(id)) {
      return new Response("Invalid or missing YouTube video ID", {
        status: 400,
        statusText: "Bad Request"
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${id}`;

    const info = await ytdl.getBasicInfo(videoUrl) as VideoInfo;
    
    try {
      validateVideoLength(info.videoDetails.lengthSeconds);
    } catch (error) {
      console.error(error);
      return new Response("Video exceeds maximum allowed length", {
        status: 400,
        statusText: "Bad Request"
      });
    }

    const title = sanitizeTitle(info.videoDetails.title);

    // Create audio stream with error handling
    const audioStream = ytdl(videoUrl, {
      quality: AUDIO_QUALITY,
      filter: 'audioonly',
      highWaterMark: 1 << 25,
      requestOptions : getRequestOptions()
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          audioStream.on("data", (chunk: Buffer) => {
            controller.enqueue(chunk);
          });

          audioStream.on("end", () => {
            controller.close();
          });

          audioStream.on("error", (error: Error) => {
            console.error("Audio stream error:", error);
            controller.error(error);
          });
        } catch (error) {
          console.error("Stream initialization error:", error);
          controller.error(error);
        }
      },
      cancel() {
        audioStream.destroy();
      }
    });

    const headers = createHeaders(title);

    return new Response(readableStream, {
      headers,
      status: 200,
      statusText: "OK"
    });

  } catch (error) {
    console.error("Failed to process the request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(errorMessage, {
      status: 500,
      statusText: "Internal Server Error"
    });
  }
}