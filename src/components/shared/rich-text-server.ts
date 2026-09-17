/**
 * Server-only module for rendering TipTap JSON to HTML.
 * Separated from rich-text-constants.ts to prevent @tiptap/html/server
 * (which pulls in happy-dom / child_process) from being bundled into
 * client components.
 */
import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/react";
import {
  addHeadingIdsToHtml,
  createTiptapExtensions,
} from "./rich-text-constants";

export function renderTiptapToHtml(
  content: unknown,
  placeholder = "",
): string {
  const raw = generateHTML(
    (content as JSONContent) ?? { type: "doc", content: [] },
    createTiptapExtensions(placeholder),
  );
  return addHeadingIdsToHtml(raw);
}
