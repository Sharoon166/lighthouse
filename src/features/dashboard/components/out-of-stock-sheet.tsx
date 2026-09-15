"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { OutOfStockProduct } from "../actions";
import { getOutOfStockProducts } from "../actions";

export function OutOfStockSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [products, setProducts] = useState<OutOfStockProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setProducts([]);
      getOutOfStockProducts()
        .then(setProducts)
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Out of Stock</SheetTitle>
          <SheetDescription>
            {products.length} product{products.length !== 1 ? "s" : ""}{" "}
            currently out of stock
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-muted-foreground">Loading…</span>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                All products are in stock
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {products.map((product) => (
                <Link
                  key={product._id}
                  href={`/admin/products/${product.slug}`}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
