"use client";

import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { ShopProductItem } from "@/lib/shop-data";

interface ProductDetailTabsProps {
  product: ShopProductItem;
  descriptionContent?: ReactNode;
  specificationsContent?: ReactNode;
}

export function ProductDetailTabs({
  product,
  descriptionContent,
  specificationsContent,
}: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");

  const totalReviewsCount = product.ratings.count || 24;

  return (
    <div className="space-y-8 bg-muted">
      {/* Tabs Bar */}
      <nav role="tablist" className="flex items-center gap-8 border-b border-border/60">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "description"}
          aria-controls="panel-description"
          onClick={() => setActiveTab("description")}
          className={`relative font-medium transition-colors pb-3 ${
            activeTab === "description"
              ? "text-foreground font-semibold border-b-2 border-gold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Description
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "specifications"}
          aria-controls="panel-specifications"
          onClick={() => setActiveTab("specifications")}
          className={`relative font-medium transition-colors pb-3 ${
            activeTab === "specifications"
              ? "text-foreground font-semibold border-b-2 border-gold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Specifications
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "reviews"}
          aria-controls="panel-reviews"
          className={`hidden relative font-medium transition-colors pb-3 ${
            activeTab === "reviews"
              ? "text-foreground font-semibold border-b-2 border-gold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Reviews ({product.reviews.length || 3})
        </button>
      </nav>

      {/* Tab 1: Description Content */}
      {activeTab === "description" && (
        <div
          id="panel-description"
          role="tabpanel"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {descriptionContent ?? (
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                DESIGN &amp; CRAFTSMANSHIP
              </span>
              <h3 className="font-serif leading-none font-normal text-foreground">
                Crafted for the spaces that matter most
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Each piece is meticulously inspected for quality, ensuring smooth
                movement across all joints and flawless luster across the
                lacquered metal surfaces.
              </p>
            </div>
          )}
          <div className="lg:col-span-5 relative aspect-square">
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
        <div
          id="panel-specifications"
          role="tabpanel"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {specificationsContent ?? (
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                TECHNICAL SPECIFICATIONS
              </span>
              <h3 className="font-serif leading-none font-normal text-foreground">
                Built to last. Specified to perform.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Every dimension and material choice in the {product.name} is
                deliberate. Solid brass construction, linen diffusion, and a
                weighted marble base are the result of a two-year development
                process focused entirely on longevity and light quality.
              </p>

              <dl className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4">
                {product.specifications.map((spec) => (
                  <div key={spec.key} className="space-y-1">
                    <dt className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      {spec.key}
                    </dt>
                    <dd className="text-xl font-medium text-black font-heading">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <div className="lg:col-span-5 relative aspect-square">
            <Image
              src={
                product.images[2] ||
                product.images[1] ||
                product.images[0] ||
                "/products/1.png"
              }
              alt={`${product.name} specifications`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Reviews Content matching Image 4 */}
      {activeTab === "reviews" && (
        <div
          id="panel-reviews"
          role="tabpanel"
          className="space-y-8"
        >
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
          <ul className="space-y-4">
            {product.reviews.map((rev) => (
              <li key={rev.id}>
                <article className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
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
                </article>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
