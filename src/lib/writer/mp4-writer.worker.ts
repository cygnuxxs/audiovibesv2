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

interface Box {
  type: string;
  offset: number;
  size: number;
  headerSize: number;
  dataOffset: number;
  dataSize: number;
}

const textEncoder = new TextEncoder();

const BOX_TYPES = {
  MOOV: "moov",
  UDTA: "udta",
  META: "meta",
  HDLR: "hdlr",
  ILST: "ilst",
  DATA: "data",
} as const;

// -----------------------------------------------------------------------------
// Basic helpers
// -----------------------------------------------------------------------------

function concatArrays(...arrays: Uint8Array[]): Uint8Array {
  let length = 0;

  for (const array of arrays) {
    length += array.length;
  }

  const result = new Uint8Array(length);

  let offset = 0;

  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }

  return result;
}

function createBox(
  type: string,
  data?: Uint8Array
): Uint8Array {
  const dataLength = data?.length ?? 0;

  if (dataLength > 0xffffffff - 8) {
    throw new Error(`Box "${type}" is too large`);
  }

  const result = new Uint8Array(8 + dataLength);
  const view = new DataView(result.buffer);

  view.setUint32(0, 8 + dataLength, false);

  result[4] = type.charCodeAt(0);
  result[5] = type.charCodeAt(1);
  result[6] = type.charCodeAt(2);
  result[7] = type.charCodeAt(3);

  if (data) {
    result.set(data, 8);
  }

  return result;
}

function createContainer(
  type: string,
  children: readonly Uint8Array[]
): Uint8Array {
  let length = 0;

  for (const child of children) {
    length += child.length;
  }

  const result = new Uint8Array(8 + length);
  const view = new DataView(result.buffer);

  view.setUint32(0, result.length, false);

  result[4] = type.charCodeAt(0);
  result[5] = type.charCodeAt(1);
  result[6] = type.charCodeAt(2);
  result[7] = type.charCodeAt(3);

  let offset = 8;

  for (const child of children) {
    result.set(child, offset);
    offset += child.length;
  }

  return result;
}

function createFullBox(
  type: string,
  version: number,
  flags: number,
  data?: Uint8Array
): Uint8Array {
  const payload = new Uint8Array(
    4 + (data?.length ?? 0)
  );

  payload[0] = version;
  payload[1] = (flags >>> 16) & 0xff;
  payload[2] = (flags >>> 8) & 0xff;
  payload[3] = flags & 0xff;

  if (data) {
    payload.set(data, 4);
  }

  return createBox(type, payload);
}

// -----------------------------------------------------------------------------
// Box parser
// -----------------------------------------------------------------------------

function readBox(
  buffer: Uint8Array,
  offset: number,
  limit = buffer.length
): Box | null {
  if (offset + 8 > limit) {
    return null;
  }

  const view = new DataView(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength
  );

  const size32 = view.getUint32(offset, false);

  const type =
    String.fromCharCode(
      buffer[offset + 4],
      buffer[offset + 5],
      buffer[offset + 6],
      buffer[offset + 7]
    );

  let size: number;
  let headerSize: number;

  if (size32 === 1) {
    if (offset + 16 > limit) {
      return null;
    }

    const high = view.getUint32(
      offset + 8,
      false
    );

    const low = view.getUint32(
      offset + 12,
      false
    );

    // JS Number can safely represent normal MP4 sizes.
    size = high * 0x100000000 + low;
    headerSize = 16;
  } else if (size32 === 0) {
    size = limit - offset;
    headerSize = 8;
  } else {
    size = size32;
    headerSize = 8;
  }

  if (
    size < headerSize ||
    offset + size > limit
  ) {
    return null;
  }

  return {
    type,
    offset,
    size,
    headerSize,
    dataOffset: offset + headerSize,
    dataSize: size - headerSize,
  };
}

function getChildren(
  buffer: Uint8Array,
  parent: Box
): Box[] {
  const result: Box[] = [];

  let offset = parent.dataOffset;
  const end = parent.dataOffset + parent.dataSize;

  while (offset < end) {
    const box = readBox(
      buffer,
      offset,
      end
    );

    if (!box) {
      throw new Error(
        `Invalid MP4 box at offset ${offset}`
      );
    }

    result.push(box);
    offset += box.size;
  }

  return result;
}

// -----------------------------------------------------------------------------
// Metadata boxes
// -----------------------------------------------------------------------------

function createDataBox(
  typeCode: number,
  payload: Uint8Array
): Uint8Array {
  const data = new Uint8Array(
    8 + payload.length
  );

  const view = new DataView(data.buffer);

  view.setUint32(
    0,
    typeCode,
    false
  );

  // locale / country
  view.setUint32(
    4,
    0,
    false
  );

  data.set(payload, 8);

  return createBox(
    BOX_TYPES.DATA,
    data
  );
}

function createStringItem(
  type: string,
  value: string
): Uint8Array {
  const payload =
    textEncoder.encode(value);

  return createContainer(
    type,
    [
      createDataBox(
        1,
        payload
      ),
    ]
  );
}

function createTrackItem(
  track: number,
  total = 0
): Uint8Array {
  const payload = new Uint8Array(8);
  const view = new DataView(
    payload.buffer
  );

  view.setUint16(
    2,
    track,
    false
  );

  view.setUint16(
    4,
    total,
    false
  );

  return createContainer(
    "trkn",
    [
      createDataBox(
        0,
        payload
      ),
    ]
  );
}

function createDiscItem(
  disc: number,
  total = 0
): Uint8Array {
  const payload = new Uint8Array(6);
  const view = new DataView(
    payload.buffer
  );

  view.setUint16(
    2,
    disc,
    false
  );

  view.setUint16(
    4,
    total,
    false
  );

  return createContainer(
    "disk",
    [
      createDataBox(
        0,
        payload
      ),
    ]
  );
}

function createArtworkItem(
  artwork: Uint8Array
): Uint8Array {
  const isPng =
    artwork.length >= 8 &&
    artwork[0] === 0x89 &&
    artwork[1] === 0x50 &&
    artwork[2] === 0x4e &&
    artwork[3] === 0x47;

  return createContainer(
    "covr",
    [
      createDataBox(
        isPng ? 14 : 13,
        artwork
      ),
    ]
  );
}

// -----------------------------------------------------------------------------
// ILST
// -----------------------------------------------------------------------------

function buildIlst(
  metadata: Metadata,
  artwork?: Uint8Array
): Uint8Array {
  const items: Uint8Array[] = [];

  const addString = (
    type: string,
    value?: string
  ) => {
    if (value) {
      items.push(
        createStringItem(type, value)
      );
    }
  };

  addString("©nam", metadata.title);
  addString("©ART", metadata.artist);
  addString("aART", metadata.albumArtist);
  addString("©alb", metadata.album);
  addString("©wrt", metadata.composer);
  addString("©gen", metadata.genre);
  addString("©day", metadata.date);
  addString("©cmt", metadata.comment);
  addString("cprt", metadata.copyright);
  addString("©too", metadata.encodingTool);
  addString("©lyr", metadata.lyrics);
  addString("desc", metadata.description);

  if (metadata.track !== undefined) {
    items.push(
      createTrackItem(
        metadata.track,
        metadata.totalTracks
      )
    );
  }

  if (metadata.disc !== undefined) {
    items.push(
      createDiscItem(
        metadata.disc,
        metadata.totalDiscs
      )
    );
  }

  if (artwork?.length) {
    items.push(
      createArtworkItem(artwork)
    );
  }

  return createContainer(
    BOX_TYPES.ILST,
    items
  );
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

function createHandler(): Uint8Array {
  const data = new Uint8Array(24);

  const view = new DataView(
    data.buffer
  );

  // pre_defined
  view.setUint32(0, 0, false);

  // handler_type = "mdir"
  data[4] = 0x6d; // m
  data[5] = 0x64; // d
  data[6] = 0x69; // i
  data[7] = 0x72; // r

  // reserved[0..2]
  // name = empty

  return createFullBox(
    BOX_TYPES.HDLR,
    0,
    0,
    data
  );
}

// -----------------------------------------------------------------------------
// META
// -----------------------------------------------------------------------------

function createMeta(
  metadata: Metadata,
  artwork?: Uint8Array
): Uint8Array {
  const hdlr =
    createHandler();

  const ilst =
    buildIlst(
      metadata,
      artwork
    );

  return createFullBox(
    BOX_TYPES.META,
    0,
    0,
    concatArrays(
      hdlr,
      ilst
    )
  );
}

// -----------------------------------------------------------------------------
// UDTA
// -----------------------------------------------------------------------------

function createUdta(
  metadata: Metadata,
  artwork?: Uint8Array
): Uint8Array {
  return createContainer(
    BOX_TYPES.UDTA,
    [
      createMeta(
        metadata,
        artwork
      ),
    ]
  );
}

// -----------------------------------------------------------------------------
// MOOV
// -----------------------------------------------------------------------------

function rebuildMoov(
  input: Uint8Array,
  moov: Box,
  metadata: Metadata,
  artwork?: Uint8Array
): Uint8Array {
  const children =
    getChildren(
      input,
      moov
    );

  const output: Uint8Array[] = [];

  let udtaFound = false;

  for (const child of children) {
    if (child.type !== BOX_TYPES.UDTA) {
      output.push(
        input.subarray(
          child.offset,
          child.offset + child.size
        )
      );

      continue;
    }

    udtaFound = true;

    output.push(
      rebuildUdta(
        input,
        child,
        metadata,
        artwork
      )
    );
  }

  if (!udtaFound) {
    output.push(
      createUdta(
        metadata,
        artwork
      )
    );
  }

  return createContainer(
    BOX_TYPES.MOOV,
    output
  );
}

// -----------------------------------------------------------------------------
// UDTA
// -----------------------------------------------------------------------------

function rebuildUdta(
  input: Uint8Array,
  udta: Box,
  metadata: Metadata,
  artwork?: Uint8Array
): Uint8Array {
  const children =
    getChildren(
      input,
      udta
    );

  const output: Uint8Array[] = [];

  let metaFound = false;

  for (const child of children) {
    if (child.type !== BOX_TYPES.META) {
      // Preserve unrelated UDTA boxes.
      output.push(
        input.subarray(
          child.offset,
          child.offset + child.size
        )
      );

      continue;
    }

    metaFound = true;

    output.push(
      createMeta(
        metadata,
        artwork
      )
    );
  }

  if (!metaFound) {
    output.push(
      createMeta(
        metadata,
        artwork
      )
    );
  }

  return createContainer(
    BOX_TYPES.UDTA,
    output
  );
}

// -----------------------------------------------------------------------------
// Chunk offsets
// -----------------------------------------------------------------------------

function shiftChunkOffsets(
  moov: Uint8Array,
  delta: number
): void {
  if (delta === 0) {
    return;
  }

  const view = new DataView(
    moov.buffer,
    moov.byteOffset,
    moov.byteLength
  );

  const visit = (
    start: number,
    end: number
  ): void => {
    let offset = start;

    while (offset < end) {
      const box =
        readBox(
          moov,
          offset,
          end
        );

      if (!box) {
        break;
      }

      if (box.type === "stco") {
        shiftStco(
          view,
          box,
          delta
        );
      } else if (box.type === "co64") {
        shiftCo64(
          view,
          box,
          delta
        );
      } else {
        visit(
          box.dataOffset,
          box.dataOffset +
          box.dataSize
        );
      }

      offset += box.size;
    }
  };

  visit(8, moov.length);
}

function shiftStco(
  view: DataView,
  box: Box,
  delta: number
): void {
  // version + flags
  const countOffset =
    box.dataOffset + 4;

  if (
    countOffset + 4 >
    box.dataOffset +
    box.dataSize
  ) {
    return;
  }

  const count =
    view.getUint32(
      countOffset,
      false
    );

  let entryOffset =
    countOffset + 4;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const oldValue =
      view.getUint32(
        entryOffset,
        false
      );

    const newValue =
      oldValue + delta;

    if (
      newValue < 0 ||
      newValue > 0xffffffff
    ) {
      throw new Error(
        "stco overflow: file requires co64 conversion"
      );
    }

    view.setUint32(
      entryOffset,
      newValue,
      false
    );

    entryOffset += 4;
  }
}

function shiftCo64(
  view: DataView,
  box: Box,
  delta: number
): void {
  const countOffset =
    box.dataOffset + 4;

  const count =
    view.getUint32(
      countOffset,
      false
    );

  let entryOffset =
    countOffset + 4;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const high =
      view.getUint32(
        entryOffset,
        false
      );

    const low =
      view.getUint32(
        entryOffset + 4,
        false
      );

    const oldValue =
      high * 0x100000000 +
      low;

    const newValue =
      oldValue + delta;

    if (newValue < 0) {
      throw new Error(
        "Invalid negative chunk offset"
      );
    }

    const newHigh =
      Math.floor(
        newValue / 0x100000000
      );

    const newLow =
      newValue -
      newHigh * 0x100000000;

    view.setUint32(
      entryOffset,
      newHigh,
      false
    );

    view.setUint32(
      entryOffset + 4,
      newLow,
      false
    );

    entryOffset += 8;
  }
}

// -----------------------------------------------------------------------------
// Main writer
// -----------------------------------------------------------------------------

export function writeMetadata(
  input: Uint8Array,
  metadata: Metadata,
  artwork?: Uint8Array
): Uint8Array {
  const topLevel: Box[] = [];

  let offset = 0;

  while (offset < input.length) {
    const box =
      readBox(
        input,
        offset
      );

    if (!box) {
      throw new Error(
        `Invalid MP4 box at offset ${offset}`
      );
    }

    topLevel.push(box);
    offset += box.size;
  }

  const moov =
    topLevel.find(
      box => box.type === "moov"
    );

  if (!moov) {
    throw new Error(
      "No moov atom found"
    );
  }

  const newMoov =
    rebuildMoov(
      input,
      moov,
      metadata,
      artwork
    );

  const delta =
    newMoov.length -
    moov.size;

  /*
   * If moov occurs before mdat, mdat moves by
   * exactly `delta`, so all chunk offsets need
   * to be shifted.
   */
  const mdat =
    topLevel.find(
      box => box.type === "mdat"
    );

  if (
    mdat &&
    moov.offset < mdat.offset
  ) {
    shiftChunkOffsets(
      newMoov,
      delta
    );
  }

  // ---------------------------------------------------------------------------
  // One final allocation for the output file.
  // All non-moov data is copied byte-for-byte.
  // ---------------------------------------------------------------------------

  const result =
    new Uint8Array(
      input.length + delta
    );

  let writeOffset = 0;

  for (const box of topLevel) {
    if (box.type === "moov") {
      result.set(
        newMoov,
        writeOffset
      );

      writeOffset +=
        newMoov.length;

      continue;
    }

    const source =
      input.subarray(
        box.offset,
        box.offset + box.size
      );

    result.set(
      source,
      writeOffset
    );

    writeOffset +=
      source.length;
  }

  return result;
}

// -----------------------------------------------------------------------------
// Worker
// -----------------------------------------------------------------------------

self.onmessage = (
  event: MessageEvent
) => {
  try {
    const {
      inputBuffer,
      metadata,
      artworkBuffer,
    } = event.data;

    const input =
      new Uint8Array(
        inputBuffer
      );

    const artwork =
      artworkBuffer
        ? new Uint8Array(
          artworkBuffer
        )
        : undefined;

    const output =
      writeMetadata(
        input,
        metadata,
        artwork
      );

    self.postMessage(
      {
        finalFileBuffer:
          output.buffer,
      },
      {
        transfer: [
          output.buffer,
        ],
      }
    );
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};