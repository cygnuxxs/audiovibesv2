/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import MP3Tag from "mp3tag.js";
import { MP3TagAPICFrame } from "mp3tag.js/types/id3v2/frames";
import internal from "stream";
import { twMerge } from "tailwind-merge";
import crypto from "node-forge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatViews(views: number) {
  if (views < 1e3) return views.toString();
  if (views >= 1e3 && views < 1e5) return (views / 1e3).toFixed(1) + "K";
  if (views >= 1e5 && views < 1e7) return (views / 1e5).toFixed(1) + "L";
  if (views >= 1e7 && views < 1e10) return (views / 1e6).toFixed(1) + "M";
  return (views / 1e7).toFixed(1) + "Cr";
}

export async function readableToBlob(readable: internal.Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return new Blob(chunks);
}

export const formatDuration = (
  totalSeconds: number | null | undefined
): string => {
  if (
    typeof totalSeconds !== "number" ||
    totalSeconds < 0 ||
    !isFinite(totalSeconds)
  ) {
    return "0m 0s";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
};

export function generateRandomId(length: number = 4): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const addSongMetadata = async (buffer: ArrayBuffer, song: Song) => {
  /* ---------- 1.  initialise mp3tag.js --------------------------- */
  const mp3tag = new MP3Tag(buffer);
  mp3tag.read();
  if (mp3tag.error) throw new Error(`Metadata read error: ${mp3tag.error}`);

  /* ---------- 2.  build standard & custom frames ---------------- */
  const commFrame = {
    descriptor: "Explicit Content",
    text: song ? "Yes" : "No",
    language: song.language,
  };

  const txxxFrames = [
    { description: "ID", text: song.id },
    { description: "PlayCount", text: song.play_count?.toString() || "" },
  ];

  /* ---------- 3.  optional album-art image (APIC) ---------------- */
  let apicFrames: MP3TagAPICFrame[] | undefined;
  const coverUrl = song.image.replace('50x50', '500x500');
  if (coverUrl) {
    try {
      const res = await fetch(coverUrl, { mode: "cors" });
      if (res.ok) {
        const imgBuf = Array.from(new Uint8Array(await res.arrayBuffer()));
        apicFrames = [
          {
            type: 3, // front cover
            data: imgBuf,
            description: "Album Art",
            format: res.headers.get("Content-Type") || "image/jpeg",
          },
        ];
      }
    } catch (e) {
      console.warn("Album-art fetch failed:", e);
    }
  }

  /* ---------- 4.  ensure v2Details exists ------------------------ */
  const existingV2 = mp3tag.tags;

  /* ---------- 5.  assemble final tag object --------------------- */
  mp3tag.tags.v2 = {
    ...existingV2, // preserve any old frames
    TIT2: song.title,
    TPE1: song.artists?.map((a) => a.name).join(", "),
    TALB: song.album as string,
    TDRC: song.year?.toString() || "",
    TDRL: song.year || "",
    TLEN: song.duration ? `${parseInt(song.duration,10) * 1_000}` : "",
    TPUB: song.label || "",
    TCON: song.language,
    TLAN: song.language,
    COMM: [commFrame],
    TXXX: txxxFrames,
    ...(apicFrames ? { APIC: apicFrames } : {}),
  };

  /* ---------- 6.  save & return updated buffer ------------------ */
  mp3tag.save(); // ID3v2.3
  if (mp3tag.error) throw new Error(`Metadata save error: ${mp3tag.error}`);

  const savedBuffer = new Uint8Array(mp3tag.buffer);
  return savedBuffer;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

export const createDownloadLink = (
  encryptedMediaUrl: string
): string | null => {
  if (!encryptedMediaUrl) return null;

  const maxQuality = { id: "_320", bitrate: "320kbps" };
  const key = "38346591";
  const iv = "00000000";

  const encrypted = crypto.util.decode64(encryptedMediaUrl);
  const decipher = crypto.cipher.createDecipher(
    "DES-ECB",
    crypto.util.createBuffer(key)
  );
  decipher.start({ iv: crypto.util.createBuffer(iv) });
  decipher.update(crypto.util.createBuffer(encrypted));
  decipher.finish();

  const decryptedLink = decipher.output.getBytes();

  // Replace the default _96 with _320 for max bitrate
  const maxBitrateUrl = decryptedLink.replace("_96", maxQuality.id);

  return maxBitrateUrl;
};

export const flattenSongsData = (data: any): Song[] =>
  data.results.map((r: any) => {
    const info = r.more_info ?? {};
    const artistMap = info.artistMap ?? {};

    return {
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      image: (r.image as string).replace('150x150', '50x50'),
      language: r.language,
      year: r.year,
      downloadUrl : createDownloadLink(info.encrypted_media_url as string),
      play_count: r.play_count,
      explicit_content: r.explicit_content as boolean,
      music: info.music,
      album: info.album,
      label: info.label,
      kbps_320: info["320kbps"],
      encrypted_media_url: info.encrypted_media_url,
      duration: parseInt(info.duration, 10),
      copyright_text: info.copyright_text,
      release_date: info.release_date,
      primary_artist_id: artistMap.primary_artists?.[0]?.id,
      primary_artist_name: artistMap.primary_artists?.[0]?.name,
      primary_artist_role: artistMap.primary_artists?.[0]?.role,
      primary_artist_image: artistMap.primary_artists?.[0]?.image,
      primary_artist_type: artistMap.primary_artists?.[0]?.type,
      primary_artist_perma_url: artistMap.primary_artists?.[0]?.perma_url,
      artists: artistMap.artists,
    };
  });