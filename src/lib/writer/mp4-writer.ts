// src/lib/writer/mp4-writer.ts

export interface Metadata {
  title?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  composer?: string;
  genre?: string;
  date?: string;
  comment?: string;
  copyright?: string;
  encodingTool?: string;
  lyrics?: string;
  description?: string;
  track?: number;
  totalTracks?: number;
  disc?: number;
  totalDiscs?: number;
}

export function writeMetadata(input: Uint8Array, metadata: Metadata, artwork?: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    // Next.js Turbopack supports native worker imports
    const worker = new Worker(new URL('./mp4-writer.worker.ts', import.meta.url));

    worker.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(new Uint8Array(event.data.finalFileBuffer));
      }
      worker.terminate();
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };

    // Extract buffers for zero-copy transfer
    const inputBuffer = input.buffer;
    const artworkBuffer = artwork?.buffer;

    const transferList: Transferable[] = [inputBuffer];
    if (artworkBuffer) {
      transferList.push(artworkBuffer);
    }

    worker.postMessage({
      inputBuffer,
      metadata,
      artworkBuffer
    }, { transfer: transferList });
  });
}
