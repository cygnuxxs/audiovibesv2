import { baseColorsV4, Theme } from "@/lib/colors-registry";

let mediaQueryList: MediaQueryList | null = null;
let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

/**
 * Applies CSS variables to the document root based on theme and mode.
 */
function applyThemeVars(theme: Theme, mode: "light" | "dark") {
  const vars = theme[mode];

  if (!vars) {
    console.warn(`Missing CSS vars for theme mode: "${mode}" in "${theme.label}"`);
    return;
  }

  const root = document.documentElement;

  // Add or remove `dark` class for TailwindCSS compatibility
  root.classList.toggle("dark", mode === "dark");

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value);
  }
}

/**
 * Finds the theme configuration by label.
 */
function getThemeByLabel(label: string): Theme | undefined {
  return baseColorsV4.find((t) => t.label === label);
}

/**
 * Applies and manages the global theme color mode.
 */
export default function setGlobalColorTheme(themeMode: ThemeMode, label: string) {
  cleanupGlobalColorTheme();

  const theme = getThemeByLabel(label);
  if (!theme) {
    console.warn(`Theme "${label}" not found in theme registry.`);
    return;
  }

  const apply = (resolvedMode: "light" | "dark") => applyThemeVars(theme, resolvedMode);

  if (themeMode === "system") {
    mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    const systemMode = mediaQueryList.matches ? "dark" : "light";

    apply(systemMode); // Initial apply

    mediaQueryListener = (e) => {
      const newMode = e.matches ? "dark" : "light";
      apply(newMode);
    };
    mediaQueryList.addEventListener("change", mediaQueryListener);
  } else {
    apply(themeMode); // Directly apply "light" or "dark"
  }
}

/**
 * Removes the media query listener (if any).
 */
export function cleanupGlobalColorTheme() {
  if (mediaQueryList && mediaQueryListener) {
    mediaQueryList.removeEventListener("change", mediaQueryListener);
    mediaQueryList = null;
    mediaQueryListener = null;
  }
}
