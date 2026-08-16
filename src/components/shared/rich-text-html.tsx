"use client";

import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { createTiptapExtensions } from "./rich-text-constants";

interface RichTextHtmlProps {
  content?: JSONContent | null;
  className?: string;
}

export function RichTextHtml({ content, className }: RichTextHtmlProps) {
  const html = useMemo(
    () =>
      generateHTML(
        content ?? { type: "doc", content: [] },
        createTiptapExtensions(""),
      ),
    [content],
  );

  return (
    <pre
      className={cn(
        "max-h-96 overflow-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground",
        className,
      )}
    >
      <code>{html || "<!-- No content yet -->"}</code>
    </pre>
  );
}
