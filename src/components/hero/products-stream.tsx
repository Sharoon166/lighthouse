"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { SectionHeader } from "@/components/shared/section-header";
import { formatCurrency } from "@/lib/format";
import type { HomepageProduct } from "@/lib/homepage-data";

function ProductGrid({ products }: { products: HomepageProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title="Customer Favorites"
        description="Explore our most popular lighting designs, chosen by homeowners, architects and interior designers for their exceptional quality and timeless style."
        ctaText="View all Products"
        ctaHref="/products"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group border"
          >
            <div className="relative overflow-hidden bg-muted aspect-square">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={1024}
                  height={1024}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="p-4">
              <h3 className="font-sans text-xl transition-colors hover:text-gold">
                {product.name}
              </h3>
              <p className="font-heading font-semibold uppercase text-muted-foreground">
                {formatCurrency(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Streaming wrapper — unwraps the products promise with `use()`.
 * Suspense in the parent handles the loading state.
 */
export function ProductsStream({
  promise,
}: {
  promise: Promise<HomepageProduct[]>;
}) {
  const products = use(promise);
  return <ProductGrid products={products} />;
}

/**
 * Fallback — renders the same grid with static fallback data so images
 * start downloading immediately.
 */
export function ProductsFallback({
  products,
}: {
  products: HomepageProduct[];
}) {
  return <ProductGrid products={products} />;
}
