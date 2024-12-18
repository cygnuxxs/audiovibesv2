import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatViews(views : number) {
  if (views < 1e3) return views.toString();
  if (views >= 1e3 && views < 1e5) return (views / 1e3).toFixed(1) + 'K';
  if (views >= 1e5 && views < 1e7) return (views / 1e5).toFixed(1) + 'L';
  if (views >= 1e7 && views < 1e10) return (views / 1e6).toFixed(1) + 'M';
  return (views / 1e7).toFixed(1) + 'Cr';
}

export function generateRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }
  return id;
}
