import { useEffect, useState } from "react";

/**
 * Persists a value to localStorage with JSON serialization.
 *
 * - Returns `initialValue` on the server and until hydration completes,
 *   preventing SSR / client mismatches.
 * - Reads lazily after mount so a corrupt or missing entry falls back
 *   to `initialValue`.
 * - Writes on every change.
 * - Syncs across tabs via the `storage` event.
 * - Never throws when storage is unavailable (private mode, quota, SSR).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Corrupt or unavailable — keep initialValue.
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable — the value stays in memory for this session.
    }
  }, [key, value, hydrated]);

  useEffect(() => {
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
