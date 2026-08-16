"use client";

import {
  ArrowExpand01Icon,
  Cancel01Icon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const DOUBLE_CLICK_SCALE = 2.5;

interface ImageZoomProps {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageZoom({ open, src, alt, onClose }: ImageZoomProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    setScale(1);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const clampScale = (next: number) =>
    Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));

  const zoomIn = () => setScale((current) => clampScale(current + 0.5));
  const zoomOut = () => setScale((current) => clampScale(current - 0.5));
  const reset = () => setScale(MIN_SCALE);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close zoomed image"
        className="absolute inset-0 z-0"
        onClick={onClose}
      />
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-border bg-card/60 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{alt}</p>
          <p className="text-xs text-muted-foreground">Scroll to zoom</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="mr-1 w-12 text-right text-xs tabular-nums text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={scale <= MIN_SCALE}
            onClick={zoomOut}
          >
            <HugeiconsIcon icon={ZoomOutAreaIcon} size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={scale >= MAX_SCALE}
            onClick={zoomIn}
          >
            <HugeiconsIcon icon={ZoomInAreaIcon} size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Reset zoom"
            disabled={scale === MIN_SCALE}
            onClick={reset}
          >
            <HugeiconsIcon icon={ArrowExpand01Icon} size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onClose}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </Button>
        </div>
      </div>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: zooming is pointer-only by design and fully available via the toolbar buttons above */}
      <div
        ref={containerRef}
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden p-4"
        onWheel={(event) => {
          event.preventDefault();
          setScale((current) =>
            clampScale(current + (event.deltaY < 0 ? 0.2 : -0.2)),
          );
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          setScale((current) =>
            current > MIN_SCALE ? MIN_SCALE : DOUBLE_CLICK_SCALE,
          );
        }}
      >
        <div className="relative size-full max-h-full max-w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            priority
            draggable={false}
            className="object-contain transition-transform duration-200 ease-out select-none"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
