"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ScrollBlurContainer } from "@/components/shared/scroll-blur-container";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
  initialSelectedImage?: string;
}

export function ProductImageGallery({
  images,
  name,
  initialSelectedImage,
}: ProductImageGalleryProps) {
  const fallbackImage = "/products/1.png";

  const getInitialIndex = () => {
    if (initialSelectedImage) {
      const index = images.indexOf(initialSelectedImage);

      if (index !== -1) {
        return index;
      }
    }

    return 0;
  };

  const [selectedIndex, setSelectedIndex] = useState(getInitialIndex);

  // Only respond when the variant's selected image changes.
  useEffect(() => {
    if (!initialSelectedImage) return;

    const index = images.indexOf(initialSelectedImage);

    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [initialSelectedImage, images]);

  const handleImageSelect = (img: string) => {
    const index = images.indexOf(img);

    if (index !== -1) {
      setSelectedIndex(index);
    }
  };

  return (
    <div className="flex flex-col-reverse gap-4">
      {/* Thumbnails */}
      <ScrollBlurContainer className="md:h-auto">
        <div className="flex shrink-0 gap-3">
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => handleImageSelect(img)}
                className={`relative size-20 shrink-0 overflow-hidden border-2 bg-muted/20 transition-all ${
                  isSelected
                    ? "border-gold"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <Image
                  src={img}
                  alt={`${name} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </button>
            );
          })}
        </div>
      </ScrollBlurContainer>

      {/* Main image */}
      <div className="relative aspect-square overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${selectedIndex * 100}%)`,
          }}
        >
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div
                key={`${img}-${idx}`}
                className="relative h-full w-full shrink-0"
              >
                <Image
                  src={img}
                  alt={`${name} view ${idx + 1}`}
                  fill
                  priority={idx === selectedIndex}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            ))
          ) : (
            <div className="relative h-full w-full shrink-0">
              <Image
                src={fallbackImage}
                alt={name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}