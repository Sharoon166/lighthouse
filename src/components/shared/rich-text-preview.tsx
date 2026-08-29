"use client";

import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  addHeadingIdsToHtml,
  createTiptapExtensions,
  tiptapContentClassName,
} from "./rich-text-constants";

interface RichTextPreviewProps {
  content?: JSONContent | null;
  className?: string;
}

export function RichTextPreview({ content, className }: RichTextPreviewProps) {
  const html = useMemo(() => {
    const raw = generateHTML(
      (content as JSONContent) ?? { type: "doc", content: [] },
      createTiptapExtensions(""),
    );
    return addHeadingIdsToHtml(raw);
  }, [content]);

  return (
    <div className={cn(tiptapContentClassName, className)}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: rendered from Tiptap JSON produced by the editor, same trust level as prior ProseMirror output */}
      <div className="tiptap" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
