"use client";

import {
  ArrowDown02Icon,
  ArrowDownIcon,
  ArrowRight02Icon,
  Bulb,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MegaCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

interface CategoriesMegaMenuProps {
  isHero: boolean;
  isActive: (href: string) => boolean;
  onMobileLinkClick?: () => void;
  mobileOpen?: boolean;
}

export function CategoriesMegaMenu({
  isHero,
  isActive,
  onMobileLinkClick,
  mobileOpen,
}: CategoriesMegaMenuProps) {
  const [categories, setCategories] = useState<MegaCategory[]>([]);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Reset mobile expanded when menu closes
  useEffect(() => {
    if (!mobileOpen) {
      setMobileExpanded(false);
    }
  }, [mobileOpen]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setDesktopOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setDesktopOpen(false), 150);
  };

  const displayedCategories = categories.slice(0, 8);

  return (
    <>
      {/* ── Desktop: Hover trigger + mega dropdown ── */}
      <div
        className="hidden md:block relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={menuRef}
      >
        {/* Trigger */}
        <Link
          href="/categories"
          onClick={(e) => {
            // Only navigate if not hovering to open mega menu
            if (desktopOpen) e.preventDefault();
          }}
          className={cn(
            "flex items-center gap-1 rounded-full px-4 py-1.5 font-medium transition-colors",
            isActive("/categories") || desktopOpen
              ? "text-gold"
              : isHero
                ? "text-background hover:text-gold"
                : "text-foreground hover:bg-muted",
          )}
        >
          Categories
          <HugeiconsIcon
            icon={ArrowDownIcon}
            size={14}
            className={cn(
              "transition-transform duration-200",
              desktopOpen && "rotate-180",
            )}
          />
        </Link>

        {/* Mega Dropdown */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50",
            "w-[min(90vw,820px)]",
            "transition-all duration-200 origin-top",
            desktopOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none",
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="rounded-2xl border border-border bg-background shadow-2xl overflow-hidden p-2">
            <div className="grid grid-cols-2 gap-0">
              {/* Left: Categories grid */}
              <div className="p-6">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">
                  Shop by Category
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {displayedCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted"
                    >
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <HugeiconsIcon icon={Bulb} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-gold transition-colors">
                          {cat.name}
                        </p>
                        {cat.productCount > 0 && (
                          <p className="text-[11px] text-muted-foreground">
                            {cat.productCount} designs
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right: Featured image + CTA */}
              <div className="relative bg-muted">
                {displayedCategories[0] && (
                  <>
                    <Image
                      src={displayedCategories[0].image}
                      alt={displayedCategories[0].name}
                      fill
                      className="object-cover brightness-75 rounded-2xl"
                      sizes="400px"
                    />
                    <div className="relative z-10 flex flex-col justify-end h-full p-6">
                      <p className="text-xs font-semibold tracking-widest text-gold uppercase mb-1">
                        Featured
                      </p>
                      <p className="text-lg font-heading font-semibold text-white mb-3">
                        {displayedCategories[0].name}
                      </p>
                      <Link
                        href={`/categories/${displayedCategories[0].slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-gold transition-colors"
                      >
                        Explore Collection
                        <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border mx-2 mt-4 px-6 py-3 flex items-center justify-between bg-muted/30">
              <Link
                href="/categories"
                className="text-sm font-medium text-gold hover:underline"
                onClick={() => setDesktopOpen(false)}
              >
                View all categories
              </Link>
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setDesktopOpen(false)}
              >
                Browse all products →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: Expandable accordion ── */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileExpanded((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl px-5 py-3 text-xl font-medium transition-all",
            isActive("/categories") || mobileExpanded
              ? "text-secondary text-3xl font-bold"
              : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <span>Categories</span>
          <HugeiconsIcon
            icon={ArrowDownIcon}
            size={20}
            className={cn(
              "transition-transform duration-200",
              mobileExpanded && "rotate-180",
            )}
          />
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            mobileExpanded ? "max-h-125 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="pl-5 pb-2 pt-1 space-y-1">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={onMobileLinkClick}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-base text-foreground/70 hover:bg-muted/60 hover:text-foreground transition-all"
                >
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <span>{cat.name}</span>
                </Link>
              ))
            ) : (
              <Link
                href="/categories"
                onClick={onMobileLinkClick}
                className="block rounded-xl px-4 py-2.5 text-base text-foreground/70 hover:bg-muted/60 hover:text-foreground transition-all"
              >
                View All Categories
              </Link>
            )}
            {categories.length > 0 && (
              <Link
                href="/categories"
                onClick={onMobileLinkClick}
                className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium text-gold hover:underline"
              >
                View all categories
                <HugeiconsIcon icon={ArrowRight02Icon} size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
