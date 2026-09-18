"use client";

import {
  ArrowDownIcon,
  ArrowRight02Icon,
  Bulb,
  Cancel01Icon,
  ChevronRightIcon,
  Menu11Icon,
  Search01Icon,
  ShoppingBag02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import LogoImage from "@/components/shared/logo-img";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const IS_PHASE_2 = false;

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blogs" },
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
  const [productsOpen, setProductsOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const productsHoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);

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
   * Sticky header: hide on scroll down, show on scroll up
   * --------------------------------------------------
   */

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY.current;

    // Only toggle after scrolling past a threshold to avoid jitter
    if (Math.abs(delta) < 8) return;

    if (delta > 0 && currentScrollY > 80) {
      // Scrolling down & past threshold → hide
      setHeaderVisible(false);
    } else if (delta < 0) {
      // Scrolling up → always show
      setHeaderVisible(true);
    }

    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

  const handleProductsMouseEnter = () => {
    if (productsHoverTimeoutRef.current)
      clearTimeout(productsHoverTimeoutRef.current);
    setProductsOpen(true);
  };

  const handleProductsMouseLeave = () => {
    productsHoverTimeoutRef.current = setTimeout(
      () => setProductsOpen(false),
      150,
    );
  };

  return (
    <>
      <header
        className={cn(
          "z-50 w-full transition-transform duration-300 ease-in-out",
          isHero
            ? "absolute top-0 py-4"
            : "sticky top-0 bg-background py-3 backdrop-blur-md border-b border-border/50",
          !isHero && !headerVisible && "-translate-y-full",
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
                PRODUCTS MEGA MENU (hover-based, click navigates)
            ------------------------------------------------------------- */}

              <NavigationMenuItem
                onPointerEnter={handleProductsMouseEnter}
                onPointerLeave={handleProductsMouseLeave}
              >
                <Link
                  href="/products"
                  className={cn(
                    "flex items-center gap-1 rounded-full px-4 py-1.5 font-medium transition-colors",
                    isActive("/products")
                      ? "text-gold"
                      : isHero
                        ? "text-background hover:text-gold"
                        : "text-foreground hover:bg-muted",
                  )}
                >
                  Products
                  <HugeiconsIcon
                    icon={ArrowDownIcon}
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      productsOpen && "rotate-180",
                    )}
                  />
                </Link>
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
            PRODUCTS MEGA DROPDOWN (centered on page)
        ================================================================= */}

          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 hidden md:block",
              "w-[min(90vw,920px)]",
              "transition-all duration-200 origin-top",
              productsOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none",
            )}
            onPointerEnter={handleProductsMouseEnter}
            onPointerLeave={handleProductsMouseLeave}
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl p-2">
              <div className="grid grid-cols-[1.15fr_0.85fr]">
                {/* LEFT - CATEGORIES */}
                <div className="p-5 sm:p-7">
                  <div className="mb-4 sm:mb-6 flex items-end justify-between">
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                        Collections
                      </p>
                      <p className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-secondary">
                        Shop by category
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {categories.length} categories
                    </span>
                  </div>

                  {displayedCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                      {displayedCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          onClick={() => setProductsOpen(false)}
                          className="group flex items-center gap-3 rounded-xl transition-all duration-200 hover:bg-muted/70 w-full p-2.5"
                        >
                          <div className="relative size-10 sm:size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                sizes="44px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
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

                          <HugeiconsIcon
                            icon={ArrowRight02Icon}
                            size={14}
                            className="mr-1 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-gold group-hover:opacity-100 max-sm:hidden"
                          />
                        </Link>
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

                {/* RIGHT - FEATURED */}
                <div className="relative m-1.5 hidden sm:block min-h-72 sm:min-h-87.5 overflow-hidden rounded-4xl bg-muted">
                  {featuredCategory && (
                    <>
                      {featuredCategory.image && (
                        <Image
                          src={featuredCategory.image}
                          alt={featuredCategory.name}
                          fill
                          sizes="400px"
                          className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                        />
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <div className="text-xs text-gold font-semibold uppercase">
                          Featured collection
                        </div>
                        <span className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-white">
                          {featuredCategory.name}
                        </span>
                        {featuredCategory.description && (
                          <p className="mt-1.5 line-clamp-2 max-w-70 text-xs leading-relaxed text-white/70">
                            {featuredCategory.description}
                          </p>
                        )}
                        <Link
                          href={`/categories/${featuredCategory.slug}`}
                          onClick={() => setProductsOpen(false)}
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

              {/* Footer */}
              <div className="mx-3 flex items-center justify-between border-t border-border/60 py-3.5">
                <Link
                  href="/categories"
                  onClick={() => setProductsOpen(false)}
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
                  onClick={() => setProductsOpen(false)}
                  className="px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Browse all products
                </Link>
              </div>
            </div>
          </div>

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
                  placeholder="Search..."
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

        </div>
      </header>

      {/* Mobile menu toggle — outside header so it stays above the overlay */}
      <button
        type="button"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
        className={cn(
          "fixed top-3 right-4 z-[70] flex size-10 items-center justify-center rounded-full backdrop-blur-md md:hidden",
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

      {/* ================================================================
          MOBILE FULLSCREEN MENU
      ================================================================= */}

      <div
        className={cn(
          "fixed inset-0 z-60 flex flex-col bg-background px-6 pb-8 pt-24 backdrop-blur-2xl",
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
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </form>

          {/* --------------------------------------------------------------
              MOBILE NAV — slide between main menu & categories
          --------------------------------------------------------------- */}

          <div className="relative flex-1 overflow-hidden">
            {/* Main nav panel */}
            <nav
              className={cn(
                "absolute inset-0 flex flex-col gap-1 overflow-auto transition-transform duration-300 ease-in-out",
                mobileCategoriesOpen
                  ? "-translate-x-full opacity-0"
                  : "translate-x-0 opacity-100",
              )}
            >
              {/* Products → opens categories sub-panel */}
              <button
                type="button"
                onClick={() => setMobileCategoriesOpen(true)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-xl font-medium transition-all",
                  isActive("/products")
                    ? "text-3xl font-bold text-secondary"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>Products</span>

                <HugeiconsIcon
                  icon={ChevronRightIcon}
                  size={20}
                  className="text-muted-foreground transition-transform duration-200"
                />
              </button>

              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center rounded-2xl px-5 py-3.5 text-xl font-medium transition-all",
                    isActive(href)
                      ? "text-3xl font-bold text-secondary"
                      : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <span>{label}</span>
                </Link>
              ))}

              {/* Quick links */}
              <div className="mt-auto border-t border-border pt-4">
                <Link
                  href="/products"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-medium text-gold transition-all hover:bg-muted/60"
                >
                  View all products
                  <HugeiconsIcon icon={ChevronRightIcon} size={16} />
                </Link>
              </div>
            </nav>

            {/* Categories sub-panel */}
            <nav
              className={cn(
                "absolute inset-0 flex flex-col overflow-auto transition-transform duration-300 ease-in-out",
                mobileCategoriesOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0",
              )}
            >
              {/* Back button */}
              <button
                type="button"
                onClick={() => setMobileCategoriesOpen(false)}
                className="flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-xl font-medium text-foreground/80 transition-all hover:bg-muted/60 hover:text-foreground"
              >
                <HugeiconsIcon
                  icon={ChevronRightIcon}
                  size={20}
                  className="rotate-180"
                />
                <span>Back</span>
              </button>

              {/* Categories list */}
              <div className="flex flex-col gap-1 overflow-y-auto scrollbar-hide pb-4">
                <Link
                  href="/products"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between rounded-2xl px-5 py-3.5 text-xl font-semibold text-gold transition-all hover:bg-muted/60"
                >
                  <span>View all products</span>
                  <HugeiconsIcon icon={ChevronRightIcon} size={18} />
                </Link>

                <div className="my-2 h-px bg-border" />

                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-xl px-5 py-3 text-base text-foreground/70 transition-all hover:bg-muted/60 hover:text-foreground"
                    >
                      <div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <HugeiconsIcon icon={Bulb} size={14} />
                          </div>
                        )}
                      </div>

                      <span className="flex-1">{category.name}</span>
                      <HugeiconsIcon
                        icon={ChevronRightIcon}
                        size={16}
                        className="text-muted-foreground"
                      />
                    </Link>
                  ))
                ) : (
                  <Link
                    href="/categories"
                    onClick={closeMobileMenu}
                    className="block rounded-xl px-5 py-3 text-base text-foreground/70 transition-all hover:bg-muted/60 hover:text-foreground"
                  >
                    View All Categories
                  </Link>
                )}

                <div className="mt-2 border-t border-border pt-4">
                  <Link
                    href="/categories"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-medium text-gold transition-all hover:bg-muted/60"
                  >
                    View all categories
                    <HugeiconsIcon icon={ChevronRightIcon} size={16} />
                  </Link>
                </div>
              </div>
            </nav>
          </div>

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
    </>
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
