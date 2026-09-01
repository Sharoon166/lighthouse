"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ProductCardItem {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
}

interface ProductCardProps {
  product: ProductCardItem;
  /** Show the add-to-cart button */
  showAddToCart?: boolean;
}

export function ProductCard({
  product,
  showAddToCart = true,
}: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group border">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          width={1024}
          height={1024}
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-sans">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground font-semibold uppercase font-heading">
            {product.price}
          </p>
          {showAddToCart && (
            <Button variant="secondary" className="rounded-full">
              <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
