"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Constants for localStorage key and default theme
const THEME_STORAGE_KEY = "app-theme";
const DEFAULT_THEME = "rose";

type ThemeContextType = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: string;
}) {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme) {
        return storedTheme;
      }
    }
    return initialTheme || DEFAULT_THEME;
  });

  useEffect(() => {
    // Batch DOM operations using requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      localStorage.setItem(THEME_STORAGE_KEY, activeTheme);

      const root = document.documentElement; // <html>

      // Use a more efficient approach - directly set the class list
      const currentClasses = root.className.split(' ');
      const filteredClasses = currentClasses.filter((c) => !c.startsWith("theme-"));

      // Build new class list
      const newClasses = [...filteredClasses, `theme-${activeTheme}`];
      if (activeTheme.endsWith("-scaled")) {
        newClasses.push("theme-scaled");
      }

      // Single DOM write operation
      root.className = newClasses.join(' ');
    });
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      "useThemeConfig must be used within an ActiveThemeProvider"
    );
  }
  return context;
}
