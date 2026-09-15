"use client";

import { ExpandIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPriceRange } from "@/lib/format";
import type { ShopProductItem } from "@/lib/shop-data";
import { useQuickView } from "./quick-view";

interface ProductCardProps {
  product: ShopProductItem;
  showQuickView?: boolean;
}

export function ProductCard({
  product,
  showQuickView = true,
}: ProductCardProps) {
  const { open } = useQuickView();
  const [isHovered, setIsHovered] = useState(false);

  // Get current image based on hover state (images are already combined on server)
  const currentImage = useMemo(() => {
    if (isHovered && product.images.length > 1) {
      return product.images[1]; // Show second image on hover
    }
    return product.images[0] || "/products/1.png"; // Show first image by default
  }, [isHovered, product.images]);

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
    <div
      className="group border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <div className="relative h-full w-full">
            {/* First image (default) */}
            <Image
              src={product.images[0] || "/products/1.png"}
              alt={product.name}
              width={1024}
              height={1024}
              className={`absolute inset-0 h-full w-full object-contain transition-all duration-500 ease-in-out ${
                isHovered && product.images.length > 1
                  ? "-translate-x-full opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            />
            {/* Second image (hover) */}
            {product.images.length > 1 && (
              <Image
                src={product.images[1]}
                alt={`${product.name} alternate view`}
                width={1024}
                height={1024}
                className={`absolute inset-0 h-full w-full object-contain transition-all duration-500 ease-in-out ${
                  isHovered
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                }`}
              />
            )}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xl font-sans hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground font-semibold uppercase font-heading">
            {priceDisplay}
          </p>
          {showQuickView && (
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => open(product)}
              aria-label={`Quick view ${product.name}`}
            >
              <HugeiconsIcon icon={ExpandIcon} size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
