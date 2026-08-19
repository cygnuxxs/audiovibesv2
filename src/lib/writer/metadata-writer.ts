// @ts-ignore
import createFFmpegCore from './ffmpeg-core.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface WriterModule {
    writeMetadata(
        input: Uint8Array,
        metadata: Metadata,
        artwork?: Uint8Array
    ): Uint8Array;
}

export interface Metadata {
    // String atoms (©nam, ©ART, ©alb, …)
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
    grouping?: string;
    description?: string;
    synopsis?: string;
    show?: string;
    episodeId?: string;
    network?: string;

    // Track / disc numbering (trkn / disk atoms — "N/Total" format)
    track?: number;
    totalTracks?: number;
    disc?: number;
    totalDiscs?: number;

    // Integer atoms
    bpm?: number;
    mediaType?: number;

    // Boolean atoms (1-byte flags)
    hdVideo?: boolean;
    gaplessPlayback?: boolean;
    compilation?: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Mapping from camelCase `Metadata` keys to their FFmpeg/movenc counterpart. */
const STRING_KEY_MAP: ReadonlyArray<readonly [keyof Metadata, string]> = [
    ['title', 'title'],
    ['artist', 'artist'],
    ['album', 'album'],
    ['albumArtist', 'album_artist'],
    ['composer', 'composer'],
    ['genre', 'genre'],
    ['date', 'date'],
    ['comment', 'comment'],
    ['copyright', 'copyright'],
    ['encodingTool', 'encoding_tool'],
    ['lyrics', 'lyrics'],
    ['grouping', 'grouping'],
    ['description', 'description'],
    ['synopsis', 'synopsis'],
    ['show', 'show'],
    ['episodeId', 'episode_id'],
    ['network', 'network'],
] as const;

/** Mapping from boolean `Metadata` keys to their FFmpeg counterpart. */
const BOOLEAN_KEY_MAP: ReadonlyArray<readonly [keyof Metadata, string]> = [
    ['hdVideo', 'hd_video'],
    ['gaplessPlayback', 'gapless_playback'],
    ['compilation', 'compilation'],
] as const;

/**
 * Format a number/total pair into the "N/Total" format that the mov muxer's
 * `mov_write_trkn_tag` expects for track and disc numbers.
 */
function formatSlotted(n: number, total?: number): string {
    return total ? `${n}/${total}` : String(n);
}

/** Returns true if the value is present and non-empty. */
function hasValue(v: unknown): v is string | number {
    return v !== undefined && v !== null && v !== '';
}

/**
 * Translate a `Metadata` object into the `-meta key value` argv triplets
 * that `metadata_injector.c` expects.
 */
function buildMetaArgs(metadata: Metadata): string[] {
    const args: string[] = [];

    const push = (key: string, value: string) => {
        args.push('-meta', key, value);
    };

    // String metadata
    for (const [prop, ffKey] of STRING_KEY_MAP) {
        const v = metadata[prop];
        if (hasValue(v)) push(ffKey, String(v));
    }

    // Track / disc numbering
    if (metadata.track != null) {
        push('track', formatSlotted(metadata.track, metadata.totalTracks));
    }
    if (metadata.disc != null) {
        push('disc', formatSlotted(metadata.disc, metadata.totalDiscs));
    }

    // BPM  →  tmpo atom
    if (metadata.bpm != null) {
        push('tmpo', String(metadata.bpm));
    }

    // Integer metadata
    if (metadata.mediaType != null) {
        push('media_type', String(metadata.mediaType));
    }

    // Boolean flags (written as '1' when truthy)
    for (const [prop, ffKey] of BOOLEAN_KEY_MAP) {
        if (metadata[prop]) push(ffKey, '1');
    }

    return args;
}

// ---------------------------------------------------------------------------
// MEMFS helpers
// ---------------------------------------------------------------------------

const IN_FILE = 'input.m4a';
const OUT_FILE = 'output.m4a';
const COVER_FILE = 'cover.jpg';
const NO_COVER = 'none';

/**
 * Remove a MEMFS file, ignoring errors if the file was never created.
 */
function safeUnlink(FS: any, path: string): void {
    try { FS.unlink(path); } catch { /* file may not exist */ }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export default async function createWriter(options?: any): Promise<WriterModule> {
    const core = await createFFmpegCore(options);
    const { FS, callMain } = core as any;

    return {
        writeMetadata(
            input: Uint8Array,
            metadata: Metadata,
            artwork?: Uint8Array,
        ): Uint8Array {
            const coverArg = artwork ? COVER_FILE : NO_COVER;

            // Write source files into MEMFS
            FS.writeFile(IN_FILE, input);
            if (artwork) FS.writeFile(COVER_FILE, artwork);

            try {
                const args = [IN_FILE, coverArg, OUT_FILE, ...buildMetaArgs(metadata)];
                const exitCode: number = callMain(args);

                if (exitCode !== 0) {
                    throw new Error(`metadata_injector exited with code ${exitCode}`);
                }

                return new Uint8Array(FS.readFile(OUT_FILE));
            } finally {
                // Guarantee MEMFS cleanup regardless of success or failure
                safeUnlink(FS, IN_FILE);
                safeUnlink(FS, OUT_FILE);
                if (artwork) safeUnlink(FS, COVER_FILE);
            }
        },
    };
}
