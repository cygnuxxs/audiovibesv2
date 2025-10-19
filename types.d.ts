declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

interface SearchSong {
  total: number;
  start: number;
  results: Song[];
}

interface Song {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  language: string;
  year: string;
  downloadUrl : string;
  play_count: number;
  music: string;
  album: string;
  label: string;
  is320Kbps: boolean;
  encrypted_media_url: string;
  encrypted_drm_media_url: string;
  album_url: string;
  duration: string;
  copyright_text: string;
  primary_artist_id?: string;
  primary_artist_name?: string;
  primary_artist_role?: string;
  primary_artist_image?: string;
  primary_artist_type?: string;
  primary_artist_perma_url?: string;
  artists?: Artist[];
}

interface Artist {
  id: string;
  name: string;
  role: string;
  image: string;
  type: string;
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
