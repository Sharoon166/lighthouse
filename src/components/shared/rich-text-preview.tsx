"use client";

import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  createTiptapExtensions,
  tiptapContentClassName,
} from "./rich-text-constants";

interface RichTextPreviewProps {
  content?: JSONContent | null;
  className?: string;
}

function addHeadingIds(content: JSONContent | null): JSONContent {
  if (!content) return { type: "doc", content: [] };

  let headingCounter = 1;

  const walk = (node: JSONContent): JSONContent => {
    if (node.type === "heading" && node.content) {
      return {
        ...node,
        attrs: {
          ...node.attrs,
          id: `heading-${headingCounter++}`,
        },
      };
    }

    if (node.content && Array.isArray(node.content)) {
      return {
        ...node,
        content: node.content.map(walk),
      };
    }

    return node;
  };

  return walk(content);
}

export function RichTextPreview({ content, className }: RichTextPreviewProps) {
  const contentWithIds = useMemo(() => addHeadingIds(content ?? null), [content]);

  const html = useMemo(
    () =>
      generateHTML(
        contentWithIds ?? { type: "doc", content: [] },
        createTiptapExtensions(""),
      ),
    [contentWithIds],
  );

  return (
    <div className={cn(tiptapContentClassName, className)}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: rendered from Tiptap JSON produced by the editor, same trust level as prior ProseMirror output */}
      <div className="tiptap" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
