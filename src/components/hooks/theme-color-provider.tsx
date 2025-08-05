"use client";
import setGlobalColorTheme from "@/components/hooks/theme-color-switcher";
import { useTheme } from "next-themes";
import React, { createContext, useContext, useEffect, useState } from "react";
const THEME_COLORS: ThemeColors[] = [
  "Blue",
  "Green",
  "Gray",
  "Neutral",
  "Orange",
  "Red",
  "Rose",
  "Slate",
  "Stone",
  "Violet",
  "Yellow",
  "Zinc",
] as const;
const DEFAULT_THEME_COLOR: ThemeColors = "Blue";

// Define the context shape
interface ThemeColorStateParams {
  themeColor: ThemeColors;
  setThemeColor: (color: ThemeColors) => void;
}

// Define props for the provider
interface ThemeDataProviderProps {
  children: React.ReactNode;
}

// Create the context
const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams
);

// Function to get saved theme color with validation
const getSavedThemeColor = (): ThemeColors => {
  if (typeof window === "undefined") {
    return DEFAULT_THEME_COLOR;
  }
  const savedColor = localStorage.getItem("themeColor");
  if (savedColor && THEME_COLORS.includes(savedColor as ThemeColors)) {
    return savedColor as ThemeColors;
  }
  return DEFAULT_THEME_COLOR;
};

export default function ThemeDataProvider({
  children,
}: ThemeDataProviderProps) {
  const [themeColor, setThemeColor] = useState<ThemeColors>(getSavedThemeColor);
  const { theme } = useTheme();
  useEffect(() => {
    setGlobalColorTheme(theme as "light" | "dark", themeColor);
    localStorage.setItem("themeColor", themeColor);
  }, [theme, themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useThemeContext(): ThemeColorStateParams {
  return useContext(ThemeContext);
}
