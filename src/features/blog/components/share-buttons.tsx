"use client";

import {
  CheckmarkCircle01Icon,
  Copy01Icon,
  Facebook01Icon,
  LinkSquare02Icon,
  Share08Icon,
  TwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  summary: string;
  vertical?: boolean;
}

export function ShareButtons({ title, summary, vertical }: ShareButtonsProps) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: summary, url });
      } catch {
        // User canceled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (vertical) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() =>
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
              "_blank",
              "noopener,noreferrer",
            )
          }
          className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Share on Facebook"
        >
          <HugeiconsIcon icon={Facebook01Icon} size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
              "_blank",
              "noopener,noreferrer",
            )
          }
          className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Share on Twitter"
        >
          <HugeiconsIcon icon={TwitterIcon} size={16} />
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className={`flex size-10 items-center justify-center rounded-full border transition-all ${
            copied
              ? "border-green-500/50 bg-green-500/10 text-green-500"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          aria-label={copied ? "Copied!" : "Copy link"}
        >
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle01Icon : LinkSquare02Icon}
            size={16}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() =>
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            "_blank",
            "noopener,noreferrer",
          )
        }
        className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Share on Facebook"
      >
        <HugeiconsIcon icon={Facebook01Icon} size={16} />
      </button>
      <button
        type="button"
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            "_blank",
            "noopener,noreferrer",
          )
        }
        className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Share on Twitter"
      >
        <HugeiconsIcon icon={TwitterIcon} size={16} />
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Share"
      >
        <HugeiconsIcon icon={Share08Icon} size={16} />
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className={`flex size-10 items-center justify-center rounded-full border transition-all ${
          copied
            ? "border-green-500/50 bg-green-500/10 text-green-500"
            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        aria-label={copied ? "Copied!" : "Copy link"}
      >
        <HugeiconsIcon
          icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
          size={16}
        />
      </button>
    </div>
  );
}
