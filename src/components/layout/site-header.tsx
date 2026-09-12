"use client";

import {
  ArrowDownIcon,
  ArrowRight02Icon,
  Bulb,
  Cancel01Icon,
  Menu11Icon,
  Search01Icon,
  ShoppingBag02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import LogoImage from "@/components/shared/logo-img";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const IS_PHASE_2 = false;

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/opple", label: "Opple" },
];

interface MegaCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

interface SiteHeaderProps {
  variant?: "hero" | "page";
}

export function SiteHeader({ variant = "hero" }: SiteHeaderProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<MegaCategory[]>([]);

  const isHero = variant === "hero";

  /*
   * --------------------------------------------------
   * Fetch categories
   * --------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * --------------------------------------------------
   * Mobile menu body lock
   * --------------------------------------------------
   */

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /*
   * --------------------------------------------------
   * Close mobile menu at md breakpoint
   * --------------------------------------------------
   */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
        setMobileCategoriesOpen(false);
        document.body.style.overflow = "";
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * --------------------------------------------------
   * Helpers
   * --------------------------------------------------
   */

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const displayedCategories = categories.slice(0, 8);
  const featuredCategory = displayedCategories[0];

  /*
   * --------------------------------------------------
   * Search
   * --------------------------------------------------
   */

  const handleMobileSearch = (formData: FormData) => {
    const search = formData.get("search");

    if (search && String(search).trim().length >= 2) {
      window.location.href = `/products?search=${encodeURIComponent(
        String(search).trim(),
      )}`;
    }
  };

  return (
    <header
      className={cn(
        "z-50 w-full",
        isHero ? "absolute top-0 py-4" : "static bg-background py-3",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* ================================================================
            LOGO
        ================================================================= */}

        <Link href="/" className="relative z-60 shrink-0">
          <LogoImage dark={variant === "page" || mobileOpen} />
        </Link>

        {/* ================================================================
            DESKTOP NAVIGATION
        ================================================================= */}

        <NavigationMenu
          align="center"
          // positionerClassName="!left-1/2 !-translate-x-1/2"
          className={cn(
            "hidden md:flex",
            "rounded-full px-2 py-2",
            isHero ? "bg-muted/10" : "border bg-muted/40",
          )}
        >
          <NavigationMenuList className="gap-1">
            {/* ------------------------------------------------------------
                PRODUCTS MEGA MENU
            ------------------------------------------------------------- */}

            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  "h-auto rounded-full bg-transparent px-4 py-1.5",
                  "font-medium",
                  "transition-colors",
                  "hover:bg-transparent",
                  "focus:bg-transparent",
                  "data-[state=open]:bg-transparent",
                  "data-[state=open]:hover:bg-transparent",

                  isActive("/products")
                    ? "text-gold"
                    : isHero
                      ? "text-background hover:text-gold data-[state=open]:text-gold"
                      : "text-foreground hover:bg-muted data-[state=open]:text-gold",
                )}
              >
                Products
              </NavigationMenuTrigger>

              <NavigationMenuContent
                className={cn(
                  "rounded-3xl shadow-lg",
                  "backdrop-blur-xl",
                  "data-[motion=from-start]:animate-none",
                  "data-[motion=from-end]:animate-none",
                  "data-[motion=to-start]:animate-none",
                  "data-[motion=to-end]:animate-none",
                )}
              >
                <div className="overflow-hidden rounded-[16px]">
                  {/* ================================================================
                      MAIN MEGA MENU
                  ================================================================= */}

                  <div className="grid grid-cols-[1.15fr_0.85fr] max-w-5xl">
                    {/* ==============================================================
                        LEFT - CATEGORIES
                    ============================================================== */}

                    <div className="p-7">
                      {/* Header */}

                      <div className="mb-6 flex items-end justify-between">
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                            Collections
                          </p>

                          <h3 className="font-heading text-xl font-semibold tracking-tight text-secondary">
                            Shop by category
                          </h3>
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {categories.length} categories
                        </span>
                      </div>

                      {/* Category grid */}

                      {displayedCategories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          {displayedCategories.map((category) => (
                            <NavigationMenuLink key={category.id}>
                              <Link
                                href={`/categories/${category.slug}`}
                                className="group flex items-center gap-3 rounded-xl transition-all duration-200 hover:bg-muted/70 w-full"
                              >
                                {/* Image */}

                                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                  {category.image ? (
                                    <Image
                                      src={category.image}
                                      alt={category.name}
                                      fill
                                      sizes="44px"
                                      className="object-cover  transition-transform duration-500 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="flex size-full items-center justify-center">
                                      <HugeiconsIcon
                                        icon={Bulb}
                                        size={18}
                                        className="text-muted-foreground"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Text */}

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-gold">
                                    {category.name}
                                  </p>

                                  {category.productCount > 0 && (
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                      {category.productCount} products
                                    </p>
                                  )}
                                </div>

                                {/* Arrow */}

                                <HugeiconsIcon
                                  icon={ArrowRight02Icon}
                                  size={14}
                                  className="mr-1 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-gold group-hover:opacity-100"
                                />
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      ) : (
                        <Link
                          href="/categories"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          View all categories
                        </Link>
                      )}
                    </div>

                    {/* ==============================================================
                        RIGHT - FEATURED
                    ============================================================== */}

                    <div className="relative m-1.5 min-h-87.5 overflow-hidden rounded-4xl bg-muted">
                      {featuredCategory && (
                        <>
                          {/* Image */}

                          <Image
                            src={featuredCategory.image}
                            alt={featuredCategory.name}
                            fill
                            sizes="400px"
                            className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                          />

                          {/* Content */}
                          <div className="absolute inset-x-0 bottom-0 p-6">
                            <div className="text-xs text-gold font-semibold uppercase">
                              Featured collection
                            </div>

                            <h3 className="font-heading text-2xl font-semibold tracking-tight text-white">
                              {featuredCategory.name}
                            </h3>

                            {featuredCategory.description && (
                              <p className="mt-1.5 line-clamp-2 max-w-70 text-xs leading-relaxed text-white/70">
                                {featuredCategory.description}
                              </p>
                            )}

                            <Link
                              href={`/categories/${featuredCategory.slug}`}
                              className="group mt-3 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-medium text-background transition-all hover:bg-gold/90 hover:text-background"
                            >
                              Explore collection
                              <HugeiconsIcon
                                icon={ArrowRight02Icon}
                                size={13}
                                className="transition-transform duration-200 group-hover:translate-x-0.5"
                              />
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ================================================================
                      FOOTER
                  ================================================================= */}

                  <div className="mx-3 flex items-center justify-between border-t border-border/60 py-3.5">
                    <Link
                      href="/categories"
                      className="group flex items-center gap-2 px-3 text-xs font-medium text-foreground transition-colors hover:text-gold"
                    >
                      <span>View all categories</span>

                      <HugeiconsIcon
                        icon={ArrowRight02Icon}
                        size={13}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>

                    <Link
                      href="/products"
                      className="px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Browse all products
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* ------------------------------------------------------------
                NORMAL NAV LINKS
            ------------------------------------------------------------- */}

            {NAV_LINKS.map(({ href, label }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink
                  className="rounded-full hover:bg-muted/40"
                  render={
                    <Link
                      href={href}
                      className={cn(
                        "rounded-full px-4 py-1.5 font-medium transition-colors",
                        isActive(href)
                          ? "text-gold"
                          : isHero
                            ? "text-background hover:text-gold"
                            : "text-foreground hover:bg-muted",
                      )}
                    >
                      {label}
                    </Link>
                  }
                ></NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* ================================================================
            DESKTOP ACTIONS
        ================================================================= */}

        <div
          className={cn(
            "hidden items-center gap-1 rounded-full md:flex",
            isHero ? "bg-muted/10" : "border border-border bg-muted/40",
          )}
        >
          {/* Search */}

          {!IS_PHASE_2 && (
            <form
              action="/products"
              className={cn(
                "flex items-center rounded-full px-7",
                isHero
                  ? "bg-background/10 text-background"
                  : "bg-background text-foreground",
              )}
            >
              <HugeiconsIcon icon={Search01Icon} size={18} />

              <input
                type="text"
                name="search"
                placeholder="Search...."
                className={cn(
                  "w-40 bg-transparent px-4 py-4 pl-2 text-sm outline-none",
                  "placeholder:text-current/50",
                  isHero
                    ? "text-background placeholder:text-background/50"
                    : "text-foreground placeholder:text-foreground/50",
                )}
              />
            </form>
          )}

          {/* Phase 2 search */}

          <button
            type="button"
            aria-label="Search"
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
              isHero
                ? "text-background hover:text-foreground"
                : "text-foreground",
              !IS_PHASE_2 && "hidden",
            )}
          >
            <HugeiconsIcon icon={Search01Icon} size={18} />
          </button>

          {/* Cart */}

          <Link
            href="/cart"
            aria-label="Cart"
            className={cn(
              "relative flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
              isHero
                ? "text-background hover:text-foreground"
                : "text-foreground",
              !IS_PHASE_2 && "hidden",
            )}
          >
            <HugeiconsIcon icon={ShoppingBag02Icon} size={18} />

            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-background">
              2
            </span>
          </Link>

          {/* Account */}

          <Link
            href="/account"
            aria-label="Account"
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
              isHero
                ? "text-background hover:text-foreground"
                : "text-foreground",
              !IS_PHASE_2 && "hidden",
            )}
          >
            <HugeiconsIcon icon={UserIcon} size={18} />
          </Link>
        </div>

        {/* ================================================================
            MOBILE MENU BUTTON
        ================================================================= */}

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className={cn(
            "relative z-60 flex size-10 items-center justify-center rounded-full backdrop-blur-md md:hidden",
            isHero
              ? "border border-border/40 bg-background/10 text-background"
              : "border border-border bg-muted/40 text-foreground",
            mobileOpen && "text-secondary",
          )}
        >
          <HugeiconsIcon
            icon={mobileOpen ? Cancel01Icon : Menu11Icon}
            size={20}
          />
        </button>
      </div>

      {/* ================================================================
          MOBILE FULLSCREEN MENU
      ================================================================= */}

      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-background px-6 pb-8 pt-24 backdrop-blur-2xl",
          "transition-all duration-300 ease-in-out md:hidden",

          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col">
          {/* --------------------------------------------------------------
              MOBILE SEARCH
          --------------------------------------------------------------- */}

          <form action={handleMobileSearch} className="relative mb-6">
            <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2.5">
              <HugeiconsIcon
                icon={Search01Icon}
                size={18}
                className="text-muted-foreground"
              />

              <input
                type="text"
                name="search"
                placeholder="Search...."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </form>

          {/* --------------------------------------------------------------
              MOBILE NAV
          --------------------------------------------------------------- */}

          <nav className="flex flex-col gap-1.5 overflow-auto">
            {/* Products */}

            <div>
              <button
                type="button"
                onClick={() => setMobileCategoriesOpen((prev) => !prev)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-5 py-3 text-xl font-medium transition-all",

                  isActive("/products") || mobileCategoriesOpen
                    ? "text-3xl font-bold text-secondary"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>Products</span>

                <HugeiconsIcon
                  icon={ArrowDownIcon}
                  size={20}
                  className={cn(
                    "transition-transform duration-200",
                    mobileCategoriesOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Category accordion */}

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  mobileCategoriesOpen
                    ? "max-h-150 opacity-100"
                    : "max-h-0 opacity-0",
                )}
              >
                <div className="max-h-80 overflow-y-auto scrollbar-hide pl-5 pt-1">
                  <div className="space-y-1 pb-2">
                    {categories.length > 0 ? (
                      <>
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-base text-foreground/70 transition-all hover:bg-muted/60 hover:text-foreground"
                          >
                            <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-muted">
                              {category.image ? (
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center">
                                  <HugeiconsIcon icon={Bulb} size={14} />
                                </div>
                              )}
                            </div>

                            <span>{category.name}</span>
                          </Link>
                        ))}

                        <Link
                          href="/categories"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium text-gold hover:underline"
                        >
                          View all categories
                          <HugeiconsIcon icon={ArrowRight02Icon} size={12} />
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/categories"
                        onClick={closeMobileMenu}
                        className="block rounded-xl px-4 py-2.5 text-base text-foreground/70 transition-all hover:bg-muted/60 hover:text-foreground"
                      >
                        View All Categories
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Normal links */}

            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-5 py-3 text-xl font-medium transition-all",

                  isActive(href)
                    ? "text-3xl font-bold text-secondary"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* ==============================================================
              MOBILE CTA
          ============================================================== */}

          <div
            className={cn(
              "mt-auto grid grid-cols-2 gap-3 border-t border-border/40 pt-6",
              !IS_PHASE_2 && "hidden",
            )}
          >
            <Link
              href="/cart"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/30 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <div className="relative">
                <HugeiconsIcon icon={ShoppingBag02Icon} size={18} />

                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-background">
                  2
                </span>
              </div>

              <span>Cart</span>
            </Link>

            <Link
              href="/account"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/30 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <HugeiconsIcon icon={UserIcon} size={18} />

              <span>Account</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Backwards-compatible page header.
 *
 * You can use:
 *
 * <PageHeader />
 *
 * or directly:
 *
 * <SiteHeader variant="page" />
 */
export function PageHeader() {
  return <SiteHeader variant="page" />;
}
