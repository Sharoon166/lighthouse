"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "/products/1.png");

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail vertical list */}
      <div className="flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-y-auto">
        {images.map((img, idx) => {
          const isSelected = selectedImage === img;
          return (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative size-20 rounded-lg overflow-hidden border-2 bg-muted/20 transition-all ${
                isSelected
                  ? "border-gold shadow-sm ring-1 ring-gold"
                  : "border-border/60 hover:border-border"
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </button>
          );
        })}
      </div>

      {/* Main image container */}
      <div className="relative flex-1 aspect-square md:aspect-[4/3] rounded-2xl bg-muted/20 border border-border/60 overflow-hidden">
        <Image
          src={selectedImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-8 transition-all duration-300 hover:scale-105"
        />
      </div>
    </div>
  );
}
