"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/utils";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

interface UseSlugValidationOptions {
  title: string;
  initialSlug?: string;
  collection: "blog" | "project";
  excludeSlug?: string;
  debounceMs?: number;
}

export function useSlugValidation({
  title,
  initialSlug,
  collection,
  excludeSlug,
  debounceMs = 500,
}: UseSlugValidationOptions) {
  const [slug, setSlug] = useState(initialSlug ?? slugify(title));
  const [isEdited, setIsEdited] = useState(!!initialSlug);
  const [status, setStatus] = useState<SlugStatus>(
    initialSlug ? "idle" : "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedSlug = useRef<string>("");

  const checkAvailability = useCallback(
    async (value: string) => {
      if (!value || value === excludeSlug) {
        setStatus("idle");
        return;
      }

      if (value === lastCheckedSlug.current) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("checking");
      setError(null);

      try {
        const params = new URLSearchParams({
          slug: value,
          collection,
        });
        if (excludeSlug) params.set("excludeSlug", excludeSlug);

        const response = await fetch(`/api/check-slug?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to check slug");

        const data = (await response.json()) as { available: boolean };
        lastCheckedSlug.current = value;
        setStatus(data.available ? "available" : "taken");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("error");
        setError("Could not verify slug. Please try again.");
      }
    },
    [collection, excludeSlug],
  );

  // Auto-generate slug from title when not manually edited
  useEffect(() => {
    if (isEdited) return;
    const generated = slugify(title);
    setSlug(generated);
    lastCheckedSlug.current = "";
    setStatus("idle");
  }, [title, isEdited]);

  // Debounced check on slug change (only when user has edited)
  useEffect(() => {
    if (!isEdited || !slug) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      checkAvailability(slug);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [slug, isEdited, debounceMs, checkAvailability]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSlugChange = useCallback((value: string) => {
    setIsEdited(true);
    setSlug(value);
  }, []);

  const handleBlur = useCallback(() => {
    if (slug && isEdited) {
      abortRef.current?.abort();
      checkAvailability(slug);
    }
  }, [slug, isEdited, checkAvailability]);

  return {
    slug,
    isEdited,
    status,
    error,
    handleSlugChange,
    handleBlur,
    isAvailable:
      status === "available" || (status === "idle" && !!slug && !isEdited),
    isChecking: status === "checking",
    isTaken: status === "taken",
  };
}
