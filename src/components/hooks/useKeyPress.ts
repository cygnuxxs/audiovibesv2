import { useEffect, useRef } from "react";

type KeyPressCallback = (event: KeyboardEvent) => void;

export function useKeyPress(key: string, callback: KeyPressCallback) {
  const callbackRef = useRef<KeyPressCallback>(callback);

  // Keep latest callback without reattaching listener
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs / editable elements
      if (
        (e.target instanceof HTMLElement && e.target.isContentEditable) ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        callbackRef.current(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key]);
}
