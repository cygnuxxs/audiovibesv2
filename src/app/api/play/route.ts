import { NextRequest } from "next/server";
import { spawn } from "child_process";
import YouTube from "youtube-sr";

const CONTENT_TYPE_JSON = "application/json";
const CONTENT_TYPE_MP3 = "audio/mp3";

// Enhanced yt-dlp options for faster processing
const YT_DLP_FLAGS = [
  '-f', 'bestaudio[ext=m4a]/bestaudio',
  '--extract-audio',
  '--audio-format', 'mp3',
  '--audio-quality', '0',  // Best quality for faster processing
  '--no-playlist',         // Disable playlist processing
  '--no-warnings',  
  '--quiet',
  '--no-progress',  
  '--no-colors',
  '-o', '-'               // Output to stdout
];

const createErrorResponse = (message: string, status: number): Response => 
  new Response(
    JSON.stringify({ error: message }),
    { status, headers: { "Content-Type": CONTENT_TYPE_JSON } }
  );

const streamAudio = async (videoUrl: string, title: string): Promise<Response> => {
  const { readable, writable } = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk);
    },
    flush(controller) {
      controller.terminate();
    }
  });

  let hasError = false;

  // Spawn yt-dlp with optimized flags
  const process = spawn('yt-dlp', [...YT_DLP_FLAGS, videoUrl], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Handle the streaming in the background with error handling
  (async () => {
    const writer = writable.getWriter();
    
    try {
      // Set up pipeline for direct streaming
      process.stdout!.on('data', async (chunk) => {
        if (!hasError) {
          try {
            await writer.write(chunk);
          } catch (error) {
            hasError = true;
            process.kill();
            await writer.close();
          }
        }
      });

      // Handle end of stream
      process.stdout!.on('end', async () => {
        if (!hasError) {
          try {
            await writer.close();
          } catch (error) {
            console.error("Error closing writer:", error);
          }
        }
      });

    } catch (error) {
      hasError = true;
      console.error("Streaming error:", error);
      process.kill();
      try {
        await writer.close();
      } catch {}
    }
  })();

  // Error handling
  process.stderr!.on('data', (data) => {
    if (!hasError) {
      console.error(`yt-dlp error: ${data}`);
    }
  });

  process.on('error', (error) => {
    if (!hasError) {
      hasError = true;
      console.error('Process error:', error);
      process.kill();
    }
  });

  // Set up response with optimized headers
  return new Response(readable, {
    headers: {
      'Content-Type': CONTENT_TYPE_MP3,
      'Content-Disposition': `attachment; filename="${title}.mp3"`,
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Song-Title' : title,
      'Expires': '0',
      'Connection': 'keep-alive'
    }
  });
};

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id")?.trim();
    if (!id) {
      return createErrorResponse("Missing required parameter: id", 400);
    }

    // Parallel processing of video info and stream preparation
    const videoUrl = `https://www.youtube.com/watch?v=${id}`;
    const [video] = await Promise.all([
      YouTube.getVideo(videoUrl).catch(() => null),
      // Add any other parallel tasks here if needed
    ]);

    if (!video) {
      return createErrorResponse("Video not found", 404);
    }

    const title = video.title?.toString()
      .split(' ')
      .slice(0, 4)
      .join(' ')
      .trim();

    return await streamAudio(videoUrl, title as string);
    
  } catch (error) {
    console.error("Error processing request:", error);
    return createErrorResponse("Failed to process request", 500);
  }
}