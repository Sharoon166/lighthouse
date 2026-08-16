import { useEffect, useState } from "react";

/**
 * Persists a value to localStorage with JSON serialization.
 *
 * - Reads lazily so a corrupt or missing entry falls back to `initialValue`.
 * - Writes on every change.
 * - Syncs across tabs via the `storage` event.
 * - Never throws when storage is unavailable (private mode, quota, SSR).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable — the value stays in memory for this session.
    }
  }, [key, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      try {
        setValue(
          event.newValue === null
            ? initialValue
            : (JSON.parse(event.newValue) as T),
        );
      } catch {
        // Ignore values written by other tabs that we cannot parse.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, initialValue]);

  return [value, setValue] as const;
}
