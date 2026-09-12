"use client";

import { useState } from "react";
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

  // Determine which image should be highlighted/selected
  const highlightedImage =
    selectedVariant?.images && selectedVariant.images.length > 0
      ? selectedVariant.images[0]
      : product.images[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Left: Image Gallery */}
      <ProductImageGallery
        images={product.images}
        name={product.name}
        initialSelectedImage={highlightedImage}
      />

      {/* Right: Purchase & Info Panel */}
      <ProductPurchasePanel
        product={product}
        onVariantChange={setSelectedVariant}
      />
    </div>
  );
}
