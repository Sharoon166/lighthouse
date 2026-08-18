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
const DRAG_THRESHOLD = 3;

interface ImageZoomProps {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

export function ImageZoom({ open, src, alt, onClose }: ImageZoomProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<Point>({ x: 0, y: 0 });
  const pointerOrigin = useRef<Point>({ x: 0, y: 0 });
  const didDrag = useRef(false);

  useEffect(() => {
    if (!open) return;

    setScale(1);
    setTranslate({ x: 0, y: 0 });

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

  const clampTranslate = (next: Point, atScale: number): Point => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || atScale <= 1) return { x: 0, y: 0 };
    const maxX = (rect.width * (atScale - 1)) / 2;
    const maxY = (rect.height * (atScale - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  };

  const applyScale = (next: number) => {
    const clamped = clampScale(next);
    setScale(clamped);
    setTranslate((current) =>
      clamped <= 1 ? { x: 0, y: 0 } : clampTranslate(current, clamped),
    );
  };

  const zoomIn = () => applyScale(scale + 0.5);
  const zoomOut = () => applyScale(scale - 0.5);
  const reset = () => applyScale(1);

  const onPointerDown = (event: React.PointerEvent) => {
    if (scale <= 1) return;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    didDrag.current = false;
    pointerOrigin.current = { x: event.clientX, y: event.clientY };
    dragOrigin.current = translate;
    setIsDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = event.clientX - pointerOrigin.current.x;
    const dy = event.clientY - pointerOrigin.current.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      didDrag.current = true;
    }
    setTranslate(
      clampTranslate(
        { x: dragOrigin.current.x + dx, y: dragOrigin.current.y + dy },
        scale,
      ),
    );
  };

  const onPointerUp = () => setIsDragging(false);

  return (
    <div className="animate-glance-in fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close zoomed image"
        className="absolute inset-0 z-0 cursor-default"
        onClick={onClose}
      />

      {/* top scrim + caption + close, floats over the image rather than boxing it in */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="relative z-10 flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0 pt-1">
          <p className="truncate text-sm font-medium text-white/90">{alt}</p>
          <p className="text-xs text-white/45">
            Scroll to zoom{scale > 1 ? " · Drag to pan" : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          onClick={onClose}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 text-white/80 backdrop-blur-xl hover:bg-white/15 hover:text-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </Button>
      </div>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: zooming/panning is pointer-only by design and fully available via the toolbar buttons */}
      <div
        ref={frameRef}
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden p-4"
        onWheel={(event) => {
          event.preventDefault();
          applyScale(scale + (event.deltaY < 0 ? 0.2 : -0.2));
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          applyScale(scale > MIN_SCALE ? MIN_SCALE : DOUBLE_CLICK_SCALE);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          cursor:
            scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
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
            className="object-contain select-none"
            style={{
              transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
              transition: isDragging
                ? "none"
                : "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>

      {/* floating pill toolbar — the one deliberate chrome element, everything else stays out of the way */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-6 sm:pb-8">
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/10 bg-primary p-1 shadow-2xl backdrop-blur-xl">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={scale <= MIN_SCALE}
            onClick={zoomOut}
            className="rounded-full text-white/80 hover:bg-white/15 hover:text-white disabled:text-white/25"
          >
            <HugeiconsIcon icon={ZoomOutAreaIcon} size={16} />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-white/60 select-none">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={scale >= MAX_SCALE}
            onClick={zoomIn}
            className="rounded-full text-white/80 hover:bg-white/15 hover:text-white disabled:text-white/25"
          >
            <HugeiconsIcon icon={ZoomInAreaIcon} size={16} />
          </Button>
          <div className="mx-1 h-4 w-px bg-white/10" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Reset zoom"
            disabled={scale === MIN_SCALE}
            onClick={reset}
            className="rounded-full text-white/80 hover:bg-white/15 hover:text-white disabled:text-white/25"
          >
            <HugeiconsIcon icon={ArrowExpand01Icon} size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}