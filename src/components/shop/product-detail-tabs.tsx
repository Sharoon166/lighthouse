"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useState } from "react";
import type { ShopProductItem } from "@/lib/shop-data";

interface ProductDetailTabsProps {
  product: ShopProductItem;
}

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("reviews");

  const totalReviewsCount = product.ratings.count || 24;

  return (
    <div className="space-y-8 border-t border-border/60 pt-12">
      {/* Tabs Bar */}
      <div className="flex items-center gap-8 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`relative text-sm font-medium transition-colors pb-3 ${
            activeTab === "description"
              ? "text-foreground font-semibold border-b-2 border-gold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Description
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specifications")}
          className={`relative text-sm font-medium transition-colors pb-3 ${
            activeTab === "specifications"
              ? "text-foreground font-semibold border-b-2 border-gold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Specifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`relative text-sm font-medium transition-colors pb-3 ${
            activeTab === "reviews"
              ? "text-foreground font-semibold border-b-2 border-gold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Reviews ({product.reviews.length || 3})
        </button>
      </div>

      {/* Tab 1: Description Content */}
      {activeTab === "description" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-muted/20 p-8 rounded-2xl border border-border/40">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              DESIGN &amp; CRAFTSMANSHIP
            </span>
            <h3 className="font-serif text-3xl font-normal text-foreground">
              Crafted for the spaces that matter most
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each piece is meticulously inspected for quality, ensuring smooth
              movement across all joints and flawless luster across the
              lacquered metal surfaces.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-square rounded-xl overflow-hidden bg-muted">
            <Image
              src={product.images[1] || product.images[0] || "/products/2.png"}
              alt={`${product.name} detail`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Specifications Content */}
      {activeTab === "specifications" && (
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-background">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-border/60">
              {product.specifications.map((spec) => (
                <tr
                  key={spec.key}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="w-1/3 py-3.5 px-6 font-semibold text-foreground bg-muted/20">
                    {spec.key}
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Reviews Content matching Image 4 */}
      {activeTab === "reviews" && (
        <div className="space-y-8">
          {/* Summary Box & Star breakdown */}
          <div className="flex flex-col sm:flex-row items-stretch gap-6 rounded-xl border border-border/60 bg-muted/10 p-6">
            {/* Rating score box */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-background p-6 text-center sm:w-48 shrink-0">
              <span className="font-serif text-5xl font-bold text-foreground">
                {product.ratings.average.toFixed(1)}
              </span>
              <div className="flex items-center text-amber-500 my-2">
                {[...Array(5)].map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    size={16}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {totalReviewsCount} reviews
              </span>
            </div>

            {/* Star Distribution bars matching Image 4 */}
            <div className="flex-1 space-y-2 justify-center flex flex-col">
              {product.ratings.distribution.map((dist) => {
                const percent = Math.round(
                  (dist.count / totalReviewsCount) * 100,
                );
                return (
                  <div
                    key={dist.stars}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span className="w-3 text-right font-medium text-foreground">
                      {dist.stars}
                    </span>
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={12}
                      className="fill-amber-400 text-amber-400 shrink-0"
                    />
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">
                      {dist.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List matching Image 4 */}
          <div className="space-y-4">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl border border-border/60 bg-card p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-semibold text-base text-foreground">
                      {rev.author}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {rev.date}
                    </span>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <HugeiconsIcon
                        key={i}
                        icon={StarIcon}
                        size={14}
                        className={
                          i < rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted/60 fill-none"
                        }
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
