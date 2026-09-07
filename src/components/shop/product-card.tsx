"use client";

import { ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuickView } from "./quick-view";
import type { ShopProductItem } from "@/lib/shop-data";
import { formatCurrency } from "@/lib/format";

interface ProductCardProps {
  product: ShopProductItem;
  showQuickView?: boolean;
}

export function ProductCard({
  product,
  showQuickView = true,
}: ProductCardProps) {
  const { open } = useQuickView();

  return (
    <div className="group border">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0] || "/products/1.png"}
            alt={product.name}
            width={1024}
            height={1024}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
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
            {formatCurrency(product.price)}
          </p>
          {showQuickView && (
            <Button
              variant="secondary"
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
              <HugeiconsIcon icon={ViewIcon} size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
