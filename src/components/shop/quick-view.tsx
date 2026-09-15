"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ShopProductItem } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { ProductImageGallery } from "./product-image-gallery";
import { ProductPurchasePanel } from "./product-purchase-panel";

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
          "relative z-10 w-full max-w-5xl max-h-[90vh]",
          "overflow-y-auto scrollbar-hide rounded-2xl border border-border",
          "bg-background shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        <div className="flex items-center justify-between gap-2 sticky right-0 top-0 w-full bg-background/20 backdrop-blur-md z-100 py-3 px-6 ">
          <div className="font-heading font-semibold text-xl text-secondary">
            Overview of {product.name}
          </div>
          {/* Close button */}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="z-20 mr-4 mt-4 rounded-full border border-border bg-background/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery */}
          <div className="p-4 pt-14 md:p-6 md:pt-6">
            <div className="md:sticky md:top-6">
              <ProductImageGallery
                images={product.images}
                name={product.name}
              />
            </div>
          </div>

          {/* Product info */}
          <div className="border-border p-4 md:border-l md:p-6">
            <ProductPurchasePanel product={product} compact />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
