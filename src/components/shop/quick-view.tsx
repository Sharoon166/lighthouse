"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductImageGallery } from "./product-image-gallery";
import { ProductPurchasePanel } from "./product-purchase-panel";
import type { ShopProductItem } from "@/lib/shop-data";



interface QuickViewContextType {
  open: (product: ShopProductItem) => void;
  close: () => void;
}

const QuickViewContext = createContext<QuickViewContextType>({
  open: () => {},
  close: () => {},
});

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<ShopProductItem | null>(null);

  const open = useCallback((p: ShopProductItem) => setProduct(p), []);
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
  product: ShopProductItem;
  onClose: () => void;
}) {
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
          {/* Left: Image gallery using ProductImageGallery component */}
          <div className="p-4 md:p-6 sticky top-0">
            <ProductImageGallery
              images={product.images}
              name={product.name}
            />
          </div>

          {/* Right: Collapsed ProductPurchasePanel */}
          <div className="p-4 md:p-6">
            <ProductPurchasePanel product={product} compact={true} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
