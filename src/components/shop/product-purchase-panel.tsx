"use client";

import {
  ArrowReloadVerticalIcon,
  CheckmarkBadge01Icon,
  DeliveryTruck01Icon,
  FavouriteIcon,
  MinusSignIcon,
  PlusSignIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { ShopProductItem } from "@/lib/shop-data";

interface ProductPurchasePanelProps {
  product: ShopProductItem;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedFinish, setSelectedFinish] = useState(
    product.finishes[0]?.name || "Brass",
  );
  const [quantity, setQuantity] = useState(1);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(
    {
      materialsAndCare: false,
      shippingAndReturns: false,
      payment: false,
      installationAndBulbs: false,
    },
  );

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Category Tag */}
      <span className="text-xs font-semibold uppercase tracking-widest text-gold">
        {product.tag}
      </span>

      {/* Product Title */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground">
        {product.name}
      </h1>

      {/* Rating Row */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center text-amber-500">
          {[...Array(5)].map((_, i) => (
            <HugeiconsIcon
              key={i}
              icon={StarIcon}
              size={16}
              className="fill-amber-400 text-amber-400"
            />
          ))}
        </div>
        <span className="font-semibold text-foreground">
          {product.ratings.average.toFixed(1)}
        </span>
        <span className="text-muted-foreground">
          ({product.ratings.count} reviews)
        </span>
      </div>

      {/* Pricing Row */}
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
          {formatCurrency(product.price)}
        </span>
        {product.originalPrice && (
          <span className="text-base text-muted-foreground line-through">
            {formatCurrency(product.originalPrice)}
          </span>
        )}
        {product.discountPercentage && (
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600">
            -{product.discountPercentage}%
          </span>
        )}
      </div>

      {/* Short Description */}
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {product.shortDescription}
      </p>

      {/* Finish Swatches */}
      {product.finishes && product.finishes.length > 0 && (
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            FINISH: <span className="text-foreground">{selectedFinish}</span>
          </label>
          <div className="flex items-center gap-3">
            {product.finishes.map((finish) => {
              const isSelected = selectedFinish === finish.name;
              return (
                <button
                  key={finish.name}
                  type="button"
                  onClick={() => setSelectedFinish(finish.name)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-gold bg-gold/10 text-foreground ring-1 ring-gold"
                      : "border-border bg-background text-muted-foreground hover:border-foreground"
                  }`}
                >
                  <span
                    className="size-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: finish.hex }}
                  />
                  <span>{finish.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Counter & Add to Cart */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center rounded-lg border border-border bg-background">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-10 items-center justify-center text-foreground hover:bg-muted rounded-l-lg transition-colors"
          >
            <HugeiconsIcon icon={MinusSignIcon} size={16} />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex size-10 items-center justify-center text-foreground hover:bg-muted rounded-r-lg transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
          </button>
        </div>

        <button
          type="button"
          className="flex-1 rounded-lg bg-slate-950 py-3.5 text-center text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-gold hover:text-slate-950"
        >
          ADD TO CART
        </button>

        <button
          type="button"
          aria-label="Add to wishlist"
          className="flex size-12 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-rose-500 hover:border-rose-300 transition-colors"
        >
          <HugeiconsIcon icon={FavouriteIcon} size={20} />
        </button>
      </div>

      {/* Value Badges */}
      <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <HugeiconsIcon
            icon={DeliveryTruck01Icon}
            size={18}
            className="text-gold"
          />
          <span>3–5 business days delivery within Karachi & nationwide</span>
        </div>
        <div className="flex items-center gap-2.5">
          <HugeiconsIcon
            icon={ArrowReloadVerticalIcon}
            size={18}
            className="text-gold"
          />
          <span>7 days easy return guarantee</span>
        </div>
        <div className="flex items-center gap-2.5">
          <HugeiconsIcon
            icon={CheckmarkBadge01Icon}
            size={18}
            className="text-gold"
          />
          <span>2-year warranty on electrics & internal wiring</span>
        </div>
      </div>

      {/* Accordions matching Images 3 & 5 */}
      <div className="border-t border-border/60 pt-4 space-y-3">
        {/* Materials & Care */}
        <div className="border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => toggleAccordion("materialsAndCare")}
            className="flex w-full items-center justify-between py-2 text-left font-serif text-lg font-medium text-foreground"
          >
            <span>Materials &amp; Care</span>
            <span className="text-muted-foreground text-sm">
              {openAccordions.materialsAndCare ? "−" : "+"}
            </span>
          </button>
          {openAccordions.materialsAndCare && (
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.content.materialsAndCare}
            </div>
          )}
        </div>

        {/* Shipping & Returns */}
        <div className="border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => toggleAccordion("shippingAndReturns")}
            className="flex w-full items-center justify-between py-2 text-left font-serif text-lg font-medium text-foreground"
          >
            <span>Shipping &amp; Returns</span>
            <span className="text-muted-foreground text-sm">
              {openAccordions.shippingAndReturns ? "−" : "+"}
            </span>
          </button>
          {openAccordions.shippingAndReturns && (
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.content.shippingAndReturns}
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => toggleAccordion("payment")}
            className="flex w-full items-center justify-between py-2 text-left font-serif text-lg font-medium text-foreground"
          >
            <span>Payment</span>
            <span className="text-muted-foreground text-sm">
              {openAccordions.payment ? "−" : "+"}
            </span>
          </button>
          {openAccordions.payment && (
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.content.payment}
            </div>
          )}
        </div>

        {/* Installation & Bulbs */}
        <div className="border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => toggleAccordion("installationAndBulbs")}
            className="flex w-full items-center justify-between py-2 text-left font-serif text-lg font-medium text-foreground"
          >
            <span>Installation &amp; Bulbs</span>
            <span className="text-muted-foreground text-sm">
              {openAccordions.installationAndBulbs ? "−" : "+"}
            </span>
          </button>
          {openAccordions.installationAndBulbs && (
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.content.installationAndBulbs}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
