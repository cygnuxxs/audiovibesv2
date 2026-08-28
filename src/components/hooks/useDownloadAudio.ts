import { useState, useCallback } from 'react';
import { decode } from 'he';
import { toast } from 'sonner';
import createWriter from '@/lib/writer/metadata-writer';
import { downloadBlob, sanitizeSongTitle } from '@/lib/utils';

// Helper to sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>:"\/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);
};

const useDownloadAudio = (song: Song) => {
  const { title, album } = song;

  // State for download management
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // 0 to 100
  const [downloadStatus, setDownloadStatus] = useState<string>(""); // "Downloading..." or "Processing..."
  const [audioSrcUrl, setAudioSrcUrl] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setIsProcessingDownload(true);
    setDownloadProgress(0);
    setDownloadStatus("Starting...");

    let currentAudioUrl = audioSrcUrl;

    try {
      // 1. Prepare URL
      if (!currentAudioUrl) {
        currentAudioUrl = song.downloadUrl;
        setAudioSrcUrl(currentAudioUrl);
      }
      if (!currentAudioUrl) throw new Error("Audio URL is not available.");

      // 2. Start Writer Initialization Early
      const writerPromise = createWriter();

      // 3. Fetch with Progress Tracking & Parallel Artwork Fetch
      setDownloadStatus("Downloading...");
      console.log(currentAudioUrl);

      const audioPromise = (async () => {
        const response = await fetch(`/api/proxy-audio?url=${encodeURIComponent(currentAudioUrl!)}`);
        if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
        if (!response.body) throw new Error("ReadableStream not supported in this browser.");

        const contentLength = Number(response.headers.get('Content-Length') || 0);
        const reader = response.body.getReader();

        // Array to hold chunks of data
        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          // Calculate progress if content-length exists
          if (contentLength > 0) {
            setDownloadProgress(Math.round((receivedLength / contentLength) * 100));
          }
        }

        // Concatenate chunks into a single Uint8Array
        const allChunks = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }
        return allChunks;
      })();

      const artworkPromise = (async () => {
        const coverUrl = song.image?.replace('50x50', '500x500');
        if (!coverUrl) return undefined;
        try {
          // Fallback to direct fetch if proxy route was removed
          let res = await fetch(`/api/proxy-image?url=${encodeURIComponent(coverUrl)}`).catch(() => null);
          if (!res || !res.ok) {
            console.warn("Proxy failed, falling back to direct fetch");
            res = await fetch(coverUrl, { mode: "cors" }).catch(() => null);
          }

          if (res && res.ok) {
            const buf = new Uint8Array(await res.arrayBuffer());

            // Verify magic bytes (JPEG or PNG)
            const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
            const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;

            if (isJpeg || isPng) {
              console.log(`Artwork successfully loaded as ${isJpeg ? 'JPEG' : 'PNG'}, size: ${buf.length} bytes`);
              return buf;
            } else {
              console.warn("Artwork is not a valid JPEG/PNG (might be WebP). Skipping to avoid tagger errors.");
            }
          }
        } catch (e) {
          console.warn("Artwork fetch failed", e);
        }
        return undefined;
      })();

      const lyricsPromise = (async () => {
        try {
          const trackName = sanitizeSongTitle(song.title);
          const artistName = sanitizeSongTitle(song.primary_artist_name || song.artists?.at(0)?.image || "");

          const params = new URLSearchParams({
            track_name: trackName,
            artist_name: artistName,
          });
          const res = await fetch(`/api/proxy-lyrics?${params}`);
          console.log(res.url)
          if (res.ok) {
            const results: any[] = await res.json();
            // Pick the first result that has plain lyrics
            const match = results.find((r: any) => r.plainLyrics) || results[0];
            return match?.plainLyrics || undefined;
          }
        } catch (e) {
          console.warn('Lyrics fetch failed', e);
        }
        return undefined;
      })();

      const [allChunks, artworkBuffer, writer, lyrics] = await Promise.all([audioPromise, artworkPromise, writerPromise, lyricsPromise]);

      // 4. Metadata & Download
      setDownloadStatus("Processing...");
      setDownloadProgress(100);

      const sanitizedTitle = sanitizeFilename(decode(title));
      const sanitizedAlbum = sanitizeFilename(decode(album || 'Unknown Album'));
      const finalFileName = `${sanitizedTitle} - ${sanitizedAlbum}.m4a`;

      const metadata = {
        title: decode(song.title || ''),
        artist: song.artists?.map((a: any) => decode(a.name)).join(", ") || decode(song.primary_artist_name || ''),
        album: decode((song.album as string) || ''),
        albumArtist: decode(song.primary_artist_name || ''),
        composer: decode(song.music || ''),
        genre: song.language || "",
        date: song.release_date || song.year?.toString() || "",

        track: 1,
        totalTracks: 1,
        disc: 1,
        totalDiscs: 1,

        comment: song.subtitle ? decode(song.subtitle) : '',
        copyright: decode(song.copyright_text || ""),
        encodingTool: "AudioVibes by Cygnuxxs",
        description: song.subtitle ? decode(song.subtitle) : '',
        lyrics: lyrics || '',
      };

      const updatedBuffer = writer.writeMetadata(allChunks, metadata, artworkBuffer);
      const blob = new Blob([updatedBuffer.buffer as ArrayBuffer], { type: "audio/mp4" });

      downloadBlob(blob, finalFileName);

      toast.success(`Downloaded: ${finalFileName}`);

    } catch (err) {
      console.error("Download error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Download failed: ${msg}`);
    } finally {
      setIsProcessingDownload(false);
      setDownloadProgress(0);
      setDownloadStatus("");
    }
  }, [audioSrcUrl, song, title, album]);

  return {
    isProcessingDownload,
    downloadProgress,
    downloadStatus,
    handleDownload,
  };
};

export default useDownloadAudio;
