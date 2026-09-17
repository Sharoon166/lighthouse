"use client";

import { useEffect } from "react";

/**
 * Scrolls the window to the top on mount.
 * Use on page components to ensure the user starts at the top
 * when navigating via client-side routing.
 */
export function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return null;
}
