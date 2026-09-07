"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Cancel01Icon,
  DeliveryTruck01Icon,
  CheckmarkBadge01Icon,
  ArrowReloadVerticalIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  tag: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  shortDescription: string;
  images: string[];
  finishes: { name: string; hex: string }[];
  ratings: { average: number; count: number };
  inStock: boolean;
}

interface QuickViewContextType {
  open: (product: QuickViewProduct) => void;
  close: () => void;
}

const QuickViewContext = createContext<QuickViewContextType>({
  open: () => {},
  close: () => {},
});

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<QuickViewProduct | null>(null);

  const open = useCallback((p: QuickViewProduct) => setProduct(p), []);
  const close = useCallback(() => setProduct(null), []);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [product]);

  return (
    <QuickViewContext.Provider value={{ open, close }}>
      {children}
      {product && <QuickViewPanel product={product} onClose={close} />}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  return useContext(QuickViewContext);
}

function QuickViewPanel({
  product,
  onClose,
}: {
  product: QuickViewProduct;
  onClose: () => void;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(
    product.finishes[0]?.name || "",
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close quick view"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className={cn(
          "relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground border border-border"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Top section: Image gallery + Product info (matches detail page layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: Image gallery — mirrors ProductImageGallery */}
          <div className="flex flex-col-reverse gap-3 p-4 md:p-6 border-b md:border-b-0 md:border-r border-border">
            {/* Thumbnail strip — vertical on desktop, horizontal on mobile */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-y-auto md:max-h-[500px]">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative size-16 md:size-20 shrink-0 overflow-hidden border-2 bg-muted/20 transition-all",
                      i === selectedImage
                        ? "border-gold"
                        : "border-border/60 hover:border-border",
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 aspect-square overflow-hidden">
              <Image
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                fill
                className="object-contain transition-all duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Right: Product info — mirrors ProductPurchasePanel */}
          <div className="flex flex-col gap-5 p-6 md:p-8">
            {/* Category tag */}
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              {product.tag}
            </span>

            {/* Product name */}
            <h2 className="font-serif text-2xl md:text-3xl font-normal tracking-tight text-foreground">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    size={14}
                    className={cn(
                      "text-amber-400",
                      i < Math.round(product.ratings.average)
                        ? "fill-amber-400"
                        : "fill-muted text-muted",
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">
                {product.ratings.average.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({product.ratings.count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl font-semibold text-foreground">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              {product.discountPercentage && (
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {product.shortDescription}
            </p>

            {/* Finishes */}
            {product.finishes.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Finish: <span className="text-foreground">{selectedFinish}</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {product.finishes.map((finish) => (
                    <button
                      key={finish.name}
                      type="button"
                      onClick={() => setSelectedFinish(finish.name)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        selectedFinish === finish.name
                          ? "border-gold bg-gold/10 text-foreground ring-1 ring-gold"
                          : "border-border bg-background text-muted-foreground hover:border-foreground",
                      )}
                    >
                      <span
                        className="size-3 rounded-full border border-black/20"
                        style={{ backgroundColor: finish.hex }}
                      />
                      {finish.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Trust badges */}
            <div className="grid grid-cols-1 gap-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <HugeiconsIcon icon={DeliveryTruck01Icon} size={15} className="text-gold shrink-0" />
                <span>3–5 business days delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <HugeiconsIcon icon={ArrowReloadVerticalIcon} size={15} className="text-gold shrink-0" />
                <span>7 days easy return guarantee</span>
              </div>
              <div className="flex items-center gap-2.5">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={15} className="text-gold shrink-0" />
                <span>2-year warranty on electrics</span>
              </div>
            </div>

            {/* View full details link */}
            <Link
              href={`/products/${product.slug}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
            >
              View Full Details
              <span className="text-gold">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
