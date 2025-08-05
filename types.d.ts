interface Image {
  quality: string;
  url: string;
}

interface DownloadUrl {
  quality: string;
  url: string;
}

interface Artist {
  id: string;
  name: string;
  role: string;
  type: string;
  image: Image[];
  url: string;
}

/**
 * A container for different categories of artists associated with a song.
 */
interface Artists {
  primary: Artist[];
  featured: Artist[];
  all: Artist[];
}

/**
 * Represents the album a song belongs to.
 */
interface Album {
  id: string | null;
  name: string | null;
  url: string | null;
}

/**
 * Represents a single song with all its metadata from the API.
 */
interface Song {
  id: string;
  name: string;
  type: string;
  year: number | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  album: Album;
  artists: Artists;
  image: Image[];
  downloadUrl: DownloadUrl[];
}

type ThemeMode = "dark" | "light" | "system";

interface ThemeColorStateParams {
  themeColor: ThemeColors;
  setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>>;
}

type ThemeColors =
  | "Zinc"
  | "Slate"
  | "Neutral"
  | "Gray"
  | "Stone"
  | "Red"
  | "Rose"
  | "Orange"
  | "Green"
  | "Blue"
  | "Yellow"
  | "Violet";