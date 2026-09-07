"use client";

import { ExpandIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuickView } from "./quick-view";
import type { ShopProductItem } from "@/lib/shop-data";
import { formatCurrency, formatPriceRange } from "@/lib/format";

interface ProductListItemProps {
  product: ShopProductItem;
  showQuickView?: boolean;
}

export function ProductListItem({
  product,
  showQuickView = true,
}: ProductListItemProps) {
  const { open } = useQuickView();

  const priceDisplay = useMemo(() => {
    if (product.variants.length <= 1) {
      return formatCurrency(product.price);
    }
    const prices = product.variants.map((v) => v.salePrice || v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatCurrency(min);
    return formatPriceRange(min, max);
  }, [product.variants, product.price]);

  return (
    <div className="group border border-border bg-card hover:border-gold/30 transition-colors">
      <div className="flex gap-6 p-4">
        {/* Product Image */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-40 h-40 shrink-0 overflow-hidden bg-muted"
        >
          <Image
            src={product.images[0] || "/products/1.png"}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-xl font-sans hover:text-gold transition-colors mb-2">
                {product.name}
              </h3>
            </Link>
            
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.shortDescription}
              </p>
            )}

            {/* Tags and Stock Status */}
            <div className="flex items-center gap-3 mb-3">
              {product.tag && (
                <span className="text-xs font-medium text-gold uppercase tracking-wide">
                  {product.tag}
                </span>
              )}
              {product.inStock ? (
                <span className="text-xs text-muted-foreground">In Stock</span>
              ) : (
                <span className="text-xs text-destructive">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-semibold uppercase font-heading">
              {priceDisplay}
            </p>
            
            <div className="flex items-center gap-2">
              {showQuickView && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    open({
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      tag: product.tag,
                      price: product.price,
                      originalPrice: product.originalPrice,
                      discountPercentage: product.discountPercentage,
                      shortDescription: product.shortDescription,
                      images: product.images,
                      finishes: product.finishes,
                      ratings: product.ratings,
                      inStock: product.inStock,
                    })
                  }
                  aria-label={`Quick view ${product.name}`}
                >
                  <HugeiconsIcon icon={ExpandIcon} size={16} />
                  Quick View
                </Button>
              )}
              
              <Button
                className="rounded-full"
              >
                <Link href={`/products/${product.slug}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
