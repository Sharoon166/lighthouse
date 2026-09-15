"use client";

import {
  ArrowReloadVerticalIcon,
  ArrowRight,
  CheckmarkBadge01Icon,
  ChevronDownIcon,
  DeliveryTruck01Icon,
  FavouriteIcon,
  MinusSignIcon,
  PlusSignIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { RollingNumber } from "@kitlangton/rolling-number/react";
import "@kitlangton/rolling-number/styles.css";
import { formatCurrency } from "@/lib/format";
import { PRESET_COLORS } from "@/components/shared/color-picker";
import type { ShopProductItem, ShopProductVariant } from "@/lib/shop-data";
import { IS_PHASE_2 } from "@/lib/constants";
import { Button } from "../ui/button";
import Link from "next/link";

interface ProductPurchasePanelProps {
  product: ShopProductItem;
  onVariantChange?: (variant: ShopProductVariant | undefined) => void;
  compact?: boolean;
}

export function ProductPurchasePanel({
  product,
  onVariantChange,
  compact = false,
}: ProductPurchasePanelProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >(() => {
    const defaultVariant =
      product.variants.find((v) => v.isDefault) || product.variants[0];
    return defaultVariant?.attributes || {};
  });
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

  const selectedVariant: ShopProductVariant | undefined = useMemo(() => {
    if (product.variants.length === 0) return undefined;
    return (
      product.variants.find((v) =>
        product.variantAttributes.every(
          (key) => selectedAttributes[key] === v.attributes[key],
        ),
      ) ||
      product.variants.find((v) => v.isDefault) ||
      product.variants[0]
    );
  }, [product.variants, selectedAttributes, product.variantAttributes]);

  // Notify parent component when variant changes
  useEffect(() => {
    if (selectedVariant && onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  const attributeOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    for (const attrKey of product.variantAttributes) {
      const values = new Set<string>();
      for (const v of product.variants) {
        if (v.attributes[attrKey]) {
          values.add(v.attributes[attrKey]);
        }
      }
      options[attrKey] = Array.from(values);
    }
    return options;
  }, [product.variantAttributes, product.variants]);

  const currentPrice = selectedVariant?.price || product.price;
  const currentOriginalPrice = selectedVariant?.salePrice
    ? selectedVariant.price
    : product.originalPrice;

  const handleAttributeChange = (key: string, value: string) => {
    setSelectedAttributes((prev) => {
      const next = { ...prev, [key]: value };
      // Find the variant that matches the new attribute combination
      const nextVariant = product.variants.find((v) =>
        product.variantAttributes.every(
          (attrKey) => next[attrKey] === v.attributes[attrKey],
        ),
      );
      // Clamp quantity: if new stock is lower, drop down; otherwise keep current
      if (nextVariant) {
        setQuantity((q) => Math.min(q, Math.max(1, nextVariant.stock)));
      }
      return next;
    });
  };

  const isColorAttribute = (key: string) =>
    ["color", "colour"].includes(key.toLowerCase());

  return (
    <div>
      {/* Category Tag */}
      <span className="text-xs font-semibold uppercase tracking-widest text-gold">
        {product.tag}
      </span>
      <div className="space-y-6">
        {/* Product Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-secondary">
          {product.name}
        </h1>

        {/* Rating Row */}
        <div className="hidden flexs items-center gap-2 text-sm">
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
        <div className="-mt-4 flex items-center gap-3">
          <RollingNumber
            value={currentPrice}
            locales="en-PK"
            format={{ style: "currency", currency: "PKR" }}
            duration={500}
            className="font-heading text-2xl sm:text-3xl font-semibold text-secondary tabular-nums"
          />
          {currentOriginalPrice && (
            <span className="text-base text-muted-foreground line-through">
              {formatCurrency(currentOriginalPrice)}
            </span>
          )}
          {selectedVariant?.salePrice &&
            selectedVariant.salePrice < selectedVariant.price && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600">
                -
                {Math.round(
                  ((selectedVariant.price - selectedVariant.salePrice) /
                    selectedVariant.price) *
                    100,
                )}
                %
              </span>
            )}
        </div>

        {/* Short Description */}
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pb-4 border-b-2">
          {product.shortDescription}
        </p>
      </div>

      <div className="space-y-8 mt-4">
        {/* Variant Attributes */}
        {product.variantAttributes.map((attrKey) => {
          const options = attributeOptions[attrKey];
          if (!options || options.length === 0) return null;
          const currentValue = selectedAttributes[attrKey] || options[0];
          const isColor = isColorAttribute(attrKey);

          return (
            <div key={attrKey} className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {attrKey}
              </label>

              {isColor ? (
                /* Color swatches - circular with label below */
                <div className="flex items-start gap-4">
                  {options.map((value) => {
                    const isSelected = currentValue === value;
                    const isAvailable = product.variants.some((v) =>
                      product.variantAttributes.every((k) => {
                        const val =
                          k === attrKey ? value : selectedAttributes[k];
                        return v.attributes[k] === val;
                      }),
                    );
                    // Find the matching variant to get its colorHex
                    const matchingVariant = product.variants.find((v) =>
                      product.variantAttributes.every((k) => {
                        const val =
                          k === attrKey ? value : selectedAttributes[k];
                        return v.attributes[k] === val;
                      }),
                    );
                    const hexColor =
                      matchingVariant?.colorHex ||
                      product.finishes.find((f) => f.name === value)?.hex ||
                      PRESET_COLORS.find(
                        (c) => c.name.toLowerCase() === value.toLowerCase(),
                      )?.hex ||
                      "#888888";

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleAttributeChange(attrKey, value)}
                        disabled={!isAvailable}
                        className={`flex flex-col items-center gap-2 ${
                          !isAvailable ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <span
                          className={`size-12 rounded-full border-2 transition-all ${
                            isSelected
                              ? "border-gold ring-2 ring-gold/30"
                              : "border-border hover:border-foreground"
                          }`}
                          style={{ backgroundColor: hexColor }}
                        />
                        <span
                          className={`text-xs ${
                            isSelected
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Other attributes - pill buttons */
                <div className="flex flex-wrap items-center gap-3">
                  {options.map((value) => {
                    const isSelected = currentValue === value;
                    const isAvailable = product.variants.some((v) =>
                      product.variantAttributes.every((k) => {
                        const val =
                          k === attrKey ? value : selectedAttributes[k];
                        return v.attributes[k] === val;
                      }),
                    );

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleAttributeChange(attrKey, value)}
                        disabled={!isAvailable}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-gold bg-gold/10 text-foreground ring-1 ring-gold"
                            : isAvailable
                              ? "border-border bg-background text-muted-foreground hover:border-foreground"
                              : "border-border bg-background text-muted-foreground opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Stock Status */}
        {selectedVariant && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`size-2 rounded-full ${
                selectedVariant.availability === "in_stock" &&
                selectedVariant.stock > 0
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            {selectedVariant.availability === "in_stock" &&
            selectedVariant.stock > 0 ? (
              <span className="text-muted-foreground">
                In Stock (
                <RollingNumber
                  value={selectedVariant.stock}
                  duration={500}
                  className="inline-block font-semibold text-foreground tabular-nums"
                />{" "}
                available)
              </span>
            ) : (
              <span className="text-muted-foreground">Out of Stock</span>
            )}
          </div>
        )}

        {/* Quantity Counter & Add to Cart */}
        {IS_PHASE_2 ? (
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center rounded-full border border-border bg-background">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex size-12 items-center justify-center text-foreground hover:bg-muted rounded-l-full transition-colors"
              >
                <HugeiconsIcon icon={MinusSignIcon} size={16} />
              </button>
              <RollingNumber
                value={quantity}
                duration={300}
                className="w-10 text-center text-base font-semibold text-foreground tabular-nums"
              />
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(
                      q + 1,
                      Math.max(1, selectedVariant?.stock ?? Infinity),
                    ),
                  )
                }
                className="flex size-12 items-center justify-center text-foreground hover:bg-muted rounded-r-full transition-colors"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={16} />
              </button>
            </div>

            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-slate-950 py-4 text-center text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-gold hover:text-slate-950"
            >
              Add to Cart
              <HugeiconsIcon icon={PlusSignIcon} size={18} />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            nativeButton={false}
            className="w-full tracking-widest uppercase transition-colors hover:bg-gold hover:text-slate-950"
            render={
              <Link href="/contact">
                Contact Us
                <HugeiconsIcon icon={ArrowRight} size={18} />
              </Link>
            }
          />
        )}

        {/* Save to wishlist */}
        {IS_PHASE_2 && (
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={FavouriteIcon} size={18} />
            Save to wishlist
          </button>
        )}
      </div>

      {/* Value Badges */}
      <div className="my-12 space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <HugeiconsIcon
            icon={DeliveryTruck01Icon}
            size={18}
            className="text-gold"
          />
          <span>3–5 business days delivery within Islamabad & nationwide</span>
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

      {/* Accordions - Hidden in compact mode */}
      {!compact && (
        <div className="border-t border-border/60 pt-4 space-y-3">
          {/* Materials & Care */}
          <div className="border-b border-border/60 pb-3">
            <button
              type="button"
              onClick={() => toggleAccordion("materialsAndCare")}
              className="flex w-full items-center justify-between py-2 text-left font-heading text-xl font-semibold text-black"
            >
              <span>Materials &amp; Care</span>
              <HugeiconsIcon
                icon={ChevronDownIcon}
                size={20}
                className={`text-muted-foreground transition-transform duration-200 ${openAccordions.materialsAndCare ? "rotate-180" : ""}`}
              />
            </button>
            {openAccordions.materialsAndCare && (
              <div className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.content.materialsAndCare}
              </div>
            )}
          </div>

          {/* Shipping & Returns */}
          <div className="border-b border-border/60 pb-3">
            <button
              type="button"
              onClick={() => toggleAccordion("shippingAndReturns")}
              className="flex w-full items-center justify-between py-2 text-left font-heading text-xl font-semibold text-black"
            >
              <span>Shipping &amp; Returns</span>
              <HugeiconsIcon
                icon={ChevronDownIcon}
                size={20}
                className={`text-muted-foreground transition-transform duration-200 ${openAccordions.shippingAndReturns ? "rotate-180" : ""}`}
              />
            </button>
            {openAccordions.shippingAndReturns && (
              <div className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.content.shippingAndReturns}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="border-b border-border/60 pb-3">
            <button
              type="button"
              onClick={() => toggleAccordion("payment")}
              className="flex w-full items-center justify-between py-2 text-left font-heading text-xl font-semibold text-black"
            >
              <span>Payment</span>
              <HugeiconsIcon
                icon={ChevronDownIcon}
                size={20}
                className={`text-muted-foreground transition-transform duration-200 ${openAccordions.payment ? "rotate-180" : ""}`}
              />
            </button>
            {openAccordions.payment && (
              <div className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.content.payment}
              </div>
            )}
          </div>

          {/* Installation & Bulbs */}
          <div className="border-b border-border/60 pb-3">
            <button
              type="button"
              onClick={() => toggleAccordion("installationAndBulbs")}
              className="flex w-full items-center justify-between py-2 text-left font-heading text-xl font-semibold text-black"
            >
              <span>Installation &amp; Bulbs</span>
              <HugeiconsIcon
                icon={ChevronDownIcon}
                size={20}
                className={`text-muted-foreground transition-transform duration-200 ${openAccordions.installationAndBulbs ? "rotate-180" : ""}`}
              />
            </button>
            {openAccordions.installationAndBulbs && (
              <div className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.content.installationAndBulbs}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Full Details Link - Only in compact mode */}
      {compact && (
        <div className="mt-6 pt-4 border-t border-border/60">
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
          >
            View Full Details
            <span className="text-gold">&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
