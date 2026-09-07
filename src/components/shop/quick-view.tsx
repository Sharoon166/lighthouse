"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Cancel01Icon,
  DeliveryTruck01Icon,
  CheckmarkBadge01Icon,
  ArrowReloadVerticalIcon,
  MinusSignIcon,
  PlusSignIcon,
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
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          "relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Image gallery */}
          <div className="relative bg-muted">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                      i === selectedImage
                        ? "border-gold"
                        : "border-border hover:border-muted-foreground/50",
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col gap-5 p-6 md:p-8">
            {/* Category */}
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              {product.tag}
            </span>

            {/* Name */}
            <h2 className="font-serif text-2xl md:text-3xl font-normal tracking-tight text-foreground">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    size={14}
                    className={cn(
                      "fill-amber-400 text-amber-400",
                      i < Math.round(product.ratings.average) ? "fill-amber-400" : "fill-muted text-muted",
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

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {product.shortDescription}
            </p>

            {/* Finishes */}
            {product.finishes.length > 0 && (
              <div className="space-y-2">
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
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
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

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center rounded-lg border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex size-9 items-center justify-center text-foreground hover:bg-muted rounded-l-lg transition-colors"
                >
                  <HugeiconsIcon icon={MinusSignIcon} size={14} />
                </button>
                <span className="w-9 text-center text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex size-9 items-center justify-center text-foreground hover:bg-muted rounded-r-lg transition-colors"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                </button>
              </div>

              <button
                type="button"
                className="flex-1 rounded-lg bg-slate-950 py-3 text-center text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-gold hover:text-slate-950"
              >
                ADD TO CART
              </button>
            </div>

            {/* Value badges */}
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={DeliveryTruck01Icon} size={14} className="text-gold" />
                <span>3–5 business days delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ArrowReloadVerticalIcon} size={14} className="text-gold" />
                <span>7 days easy return guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="text-gold" />
                <span>2-year warranty on electrics</span>
              </div>
            </div>

            {/* View full details link */}
            <Link
              href={`/products/${product.slug}`}
              className="text-center text-xs font-semibold uppercase tracking-wider text-gold hover:underline pt-1"
            >
              View Full Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
