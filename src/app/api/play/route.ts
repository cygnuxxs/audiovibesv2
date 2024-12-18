import { NextRequest } from "next/server";
import { exec } from "child_process";
import { Buffer } from "buffer";
import YouTube from "youtube-sr";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing required parameter: id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${id}`;
    const songTitle = (await YouTube.getVideo(videoUrl)).title as string
    const title = songTitle.split(' ').slice(0,3).join(' ')

    // Execute yt-dlp command to fetch audio as MP3
    const command = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o - ${videoUrl}`;

    return new Promise((resolve, reject) => {
      const process = exec(command, { encoding: "buffer", maxBuffer: 1024 * 1024 * 100 });

      // Explicitly type audioChunks as Buffer[]
      const audioChunks: Buffer[] = [];

      process.stdout?.on("data", (chunk) => {
        audioChunks.push(chunk); // Chunk is of type Buffer
      });

      process.stdout?.on("end", () => {
        // Once all chunks are collected, create a Blob
        const audioBuffer = Buffer.concat(audioChunks);
        const blob = new Blob([audioBuffer], { type: "audio/mp3" });

        // Resolve the response with the Blob
        resolve(
          new Response(blob.stream(), {
            headers: {
              "Content-Type": "audio/mp3",
              "Content-Disposition": `attachment; filename="${title}.mp3"`,
              "Song-Title" : `${title}`
            },
          })
        );
      });

      process.stdout?.on("error", (err) => {
        console.error("Error from yt-dlp stdout:", err);
        reject(
          new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      process.on("close", (code) => {
        if (code !== 0) {
          reject(
            new Response(
              JSON.stringify({ error: "yt-dlp exited with error." }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            )
          );
        }
      });

      process.on("error", (err) => {
        console.error("yt-dlp process error:", err);
        reject(
          new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });
  } catch (err) {
    console.error("Error fetching the audio:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch audio stream" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
