export function extractPublicId(url: string): string | null {
  const marker = "/image/upload/";
  const start = url.indexOf(marker);
  if (start === -1) return null;
  const path = url.slice(start + marker.length);
  const withoutVersion = path.replace(/^v\d+\//, "");
  const withoutExtension = withoutVersion.replace(/\.[a-z0-9]+$/i, "");
  return withoutExtension || null;
}
