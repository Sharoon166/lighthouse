"use client";

import { CheckIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import { useMemo, useState } from "react";
import { createTiptapExtensions } from "@/components/shared/rich-text-constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { prettyPrintHtml } from "../html-pretty";

interface BlogHtmlPanelProps {
  content?: JSONContent | null;
}

export function BlogHtmlPanel({ content }: BlogHtmlPanelProps) {
  const html = useMemo(() => {
    const source = generateHTML(
      content ?? { type: "doc", content: [] },
      createTiptapExtensions(""),
    );
    return prettyPrintHtml(source);
  }, [content]);

  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable; copying is best-effort.
    }
  };

  return (
    <div className="relative space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copy}
        className="absolute right-4 top-2 z-10"
      >
        <HugeiconsIcon icon={copied ? CheckIcon : Copy01Icon} size={14} />
        {copied ? "Copied" : "Copy"}
      </Button>
      <ScrollArea className="max-h-96 rounded-lg border border-border bg-muted">
        <pre className="p-4 pt-8 font-mono text-xs leading-relaxed text-foreground">
          <code>{html || "<!-- No content yet -->"}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
