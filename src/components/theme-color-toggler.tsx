"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";
import { useThemeConfig } from "@/components/active-theme";

const DEFAULT_THEMES = [
  {
    name: "Default",
    value: "default",
  },
  {
    name: "Scaled",
    value: "scaled",
  },
  {
    name: "Mono",
    value: "mono",
  },
] as const;

const COLOR_THEMES = [
  {
    name: "Blue",
    value: "blue",
  },
  {
    name: "Green",
    value: "green",
  },
  {
    name: "Amber",
    value: "amber",
  },
  {
    name: "Rose",
    value: "rose",
  },
  { name: "Red", value: "red" },
  { name: "Yellow", value: "yellow" },
  { name: "Violet", value: "violet" },
  {
    name: "Purple",
    value: "purple",
  },
  {
    name: "Orange",
    value: "orange",
  },
  {
    name: "Teal",
    value: "teal",
  },
] as const;

export default function ThemeChanger({
  className,
}: React.ComponentProps<"div">) {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  // Find the display name of the currently active theme
  const currentThemeLabel =
    [...DEFAULT_THEMES, ...COLOR_THEMES].find(
      (theme) => theme.value === activeTheme
    )?.name || "Default";

  // Helper function to get theme color class
  const getThemeColorClass = (themeValue: string): string => {
    const themeColors: Record<string, string> = {
      default: "bg-gray-500",
      scaled: "bg-gray-600",
      mono: "bg-gray-700",
      blue: "bg-blue-500",
      red : "bg-red-600",
      yellow : "bg-yellow-400",
      violet : 'bg-violet-600',
      green: "bg-green-500",
      amber: "bg-amber-500",
      rose: "bg-rose-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      teal: "bg-teal-500",
    };
    return themeColors[themeValue] || "bg-gray-500";
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="size-8 rounded-full text-primary hover:text-primary/80 hover:bg-primary/20"
          >
            <Palette className="h-4 w-4" color="currentColor" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-40 outline-none border shadow-xl backdrop-blur-xs bg-card border-border rounded-2xl overflow-auto w-fit">
          <DropdownMenuLabel className="text-xs">
            {currentThemeLabel}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {DEFAULT_THEMES.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onSelect={() => {
                setActiveTheme(theme.value);
              }}
            >
              <div
                className={`mr-2 w-4 h-4 rounded-full ${getThemeColorClass(
                  theme.value
                )}`}
              ></div>
              {theme.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-default">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Color Themes
            </span>
          </DropdownMenuItem>
          {COLOR_THEMES.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onSelect={() => {
                setActiveTheme(theme.value);
              }}
            >
              <div
                className={`mr-2 w-4 h-4 rounded-full ${getThemeColorClass(
                  theme.value
                )}`}
              ></div>
              {theme.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
