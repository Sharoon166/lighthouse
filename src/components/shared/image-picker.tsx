"use client";

import { CheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
  images: { src: string; name: string }[];
  value?: string;
  onChange: (value: string) => void;
}

export function ImagePicker({ images, value, onChange }: ImagePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {images.map((image) => {
        const selected = value === image.src;
        return (
          <button
            key={image.src}
            type="button"
            onClick={() => onChange(image.src)}
            aria-pressed={selected}
            className={cn(
              "group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-background outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              selected && "border-chart-2 ring-2 ring-chart-2/40",
            )}
          >
            <Image
              src={image.src}
              alt={image.name}
              fill
              className="object-cover"
            />
            {selected && (
              <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-chart-2 text-primary-foreground">
                <HugeiconsIcon icon={CheckIcon} size={14} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
