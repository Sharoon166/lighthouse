"use client";

import { LinkSquare02Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  title: string;
  summary: string;
  vertical?: boolean;
}

export function ShareButtons({ title, summary, vertical }: ShareButtonsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary,
          url: window.location.href,
        });
      } catch (error) {
        // User canceled share
        console.log("Share canceled");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (vertical) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleShare}
        >
          <HugeiconsIcon icon={Share08Icon} size={16} />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleCopyLink}
        >
          <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
          Copy Link
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-1.5"
      >
        <HugeiconsIcon icon={Share08Icon} size={16} />
        <span className="hidden sm:inline">Share</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-1.5"
      >
        <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
        <span className="hidden sm:inline">Copy</span>
      </Button>
    </div>
  );
}
