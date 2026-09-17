"use client";

import { useMemo, useState } from "react";
import { ProductImageGallery } from "@/components/shop/product-image-gallery";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import type { ShopProductItem, ShopProductVariant } from "@/lib/shop-data";

interface ProductDetailClientProps {
  product: ShopProductItem;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<
    ShopProductVariant | undefined
  >(() => product.variants.find((v) => v.isDefault) || product.variants[0]);

  // Just pick the variant's first image to highlight — don't reorder anything
  const highlightedImage = useMemo(() => {
    const variantImages = selectedVariant?.images ?? [];
    if (variantImages.length > 0) return variantImages[0];
    return product.images[0];
  }, [selectedVariant, product.images]);

  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Left: Image Gallery — sticky so it stays visible while scrolling the purchase panel */}
      <div className="sticky top-24">
        <ProductImageGallery
          images={product.images}
          name={product.name}
          initialSelectedImage={highlightedImage}
        />
      </div>

      {/* Right: Purchase & Info Panel */}
      <ProductPurchasePanel
        product={product}
        onVariantChange={setSelectedVariant}
      />
    </article>
  );
}
