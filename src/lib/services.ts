import YTDlpExec from "youtube-dl-exec";
import fs from "fs/promises";
import fetch from "node-fetch";

const CONSTANTS = {
  CONTENT_TYPES: {
    JSON: "application/json",
    MP3: "audio/mp3",
  },
  YT_DLP: {
    BINARY_PATH: "/tmp/yt-dlp",
    DOWNLOAD_URL:
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
  },
  AUDIO_OPTIONS: {
    format: "bestaudio[ext=m4a]/bestaudio",
    output: "-",
    extractAudio: true,
    audioFormat: "mp3",
    audioQuality: 0,
    noWarnings: true,
    quiet: true,
  },
};

// Singleton for YT-DLP Manager
class YTDlpManager {
  private static instance: YTDlpManager;
  private ytDlp: ReturnType<typeof YTDlpExec.create> | null = null;

  private constructor() {}

  static getInstance(): YTDlpManager {
    if (!YTDlpManager.instance) {
      YTDlpManager.instance = new YTDlpManager();
    }
    return YTDlpManager.instance;
  }

  private async ensureYtDlpBinary(): Promise<void> {
    try {
      await fs.access(CONSTANTS.YT_DLP.BINARY_PATH);
    } catch {
      console.log("Downloading yt-dlp binary...");
      const response = await fetch(CONSTANTS.YT_DLP.DOWNLOAD_URL);
      if (!response.ok) {
        throw new Error(
          `Failed to download yt-dlp binary: ${response.statusText}`
        );
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(CONSTANTS.YT_DLP.BINARY_PATH, buffer, { mode: 0o755 });
      console.log("yt-dlp binary downloaded and ready.");
    }
  }

  async getYTDlp(): Promise<ReturnType<typeof YTDlpExec.create>> {
    if (!this.ytDlp) {
      await this.ensureYtDlpBinary();
      this.ytDlp = YTDlpExec.create(CONSTANTS.YT_DLP.BINARY_PATH);
    }
    return this.ytDlp;
  }
}

// YouTube Audio Service
export class YouTubeAudioService {
  static createErrorResponse(message: string, status: number): Response {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": CONSTANTS.CONTENT_TYPES.JSON },
    });
  }

  static async streamAudio(videoUrl: string, title: string): Promise<Response> {
    try {
      const ytDlp = await YTDlpManager.getInstance().getYTDlp();
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      const download = ytDlp.exec(videoUrl, CONSTANTS.AUDIO_OPTIONS);

      if (!download.stdout) {
        throw new Error("No stdout available from yt-dlp.");
      }

      download.stdout.on("data", async (chunk: Buffer) => {
        await writer.write(chunk);
      });

      download.stdout.on("end", async () => {
        await writer.close();
      });

      download.stderr?.on("data", (err: Buffer) => {
        console.error("yt-dlp error:", err.toString());
      });

      return new Response(readable, {
        headers: {
          "Content-Type": CONSTANTS.CONTENT_TYPES.MP3,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(
            title
          )}.mp3"`,
          "Cache-Control": "no-store",
          "Song-Title": encodeURIComponent(title),
        },
      });
    } catch (error) {
      console.error("Error streaming audio:", error);
      return this.createErrorResponse("Failed to stream audio", 500);
    }
  }
}