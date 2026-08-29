"use client";

import { Bookmark02Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

interface HeroActionsProps {
  title: string;
  summary: string;
}

export function HeroActions({ title, summary }: HeroActionsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary,
          url: window.location.href,
        });
      } catch {
        // User canceled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookmark = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleBookmark}
        aria-label="Bookmark"
      >
        <HugeiconsIcon icon={Bookmark02Icon} size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleShare}
        aria-label="Share"
      >
        <HugeiconsIcon icon={Share08Icon} size={16} />
      </Button>
    </div>
  );
}
