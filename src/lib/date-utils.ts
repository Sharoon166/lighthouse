/**
 * Format a date string for display
 * @param dateString - ISO date string or null
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or empty string if null
 */
export function formatDate(
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
): string {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("en", options).format(new Date(dateString));
}

/**
 * Format a date string for display with time
 */
export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return formatDate(dateString);
}
