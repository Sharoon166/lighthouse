"use client";

import {
  Cancel01Icon,
  Idea01Icon,
  Menu01Icon,
  Search01Icon,
  ShoppingBag02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoImage from "@/components/shared/logo-img";
import { cn } from "@/lib/utils";
import { CategoriesMegaMenu } from "./categories-mega-menu";

const IS_PHASE_2 = false;

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  // { href: "/sale", label: "Sale" },
  { href: "/opple", label: "Opple" },
];

interface SiteHeaderProps {
  variant?: "hero" | "page";
}

export function SiteHeader({ variant = "hero" }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHero = variant === "hero";

  // Lock body scroll when mobile menu is open
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

  // Close mobile menu if window is resized past the md breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
        document.body.style.overflow = "";
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "z-50 w-full",
        isHero ? "absolute top-0 py-4" : "static bg-background py-3",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="relative z-50"
        >
          <LogoImage dark={variant == "page" || mobileOpen} />
        </Link>

        {/* Desktop nav — centered pill */}
        <nav
          className={cn(
            "hidden items-center gap-1 rounded-full px-2 py-2 md:flex",
            isHero
              ? "bg-muted/10"
              : "border bg-muted/40",
          )}
        >
          <CategoriesMegaMenu
            isHero={isHero}
            isActive={isActive}
          />
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
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
          ))}
        </nav>

        {/* Right actions — desktop */}
        <div
          className={cn(
            "hidden items-center gap-1 rounded-full md:flex",
            isHero
              ? "bg-muted/10"
              : "border border-border bg-muted/40",
          )}
        >
          {/* Search bar — Phase 1 */}
          {!IS_PHASE_2 && (
            <form
              action={`/products${typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('search') ? `?search=${encodeURIComponent(new URLSearchParams(window.location.search).get('search') || '')}` : ''}`}
              className={cn(
                "flex items-center rounded-full px-7",
                isHero
                  ? "bg-background/10 text-background"
                  : "text-foreground bg-background",
              )}
            >
              <HugeiconsIcon icon={Search01Icon} size={18} />
              <input
                type="text"
                name="search"
                placeholder="Search...."
                className={cn(
                  "w-40 bg-transparent text-sm outline-none placeholder:text-current/50 px-4 pl-2 py-4",
                  isHero
                    ? "text-background placeholder:text-background/50"
                    : "text-foreground placeholder:text-foreground/50",
                )}
              />
            </form>
          )}

          {/* Search button — Phase 2 */}
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

        {/* Mobile menu toggle button */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
          className={cn(
            "relative z-50 flex size-10 items-center justify-center rounded-full backdrop-blur-md md:hidden",
            isHero
              ? "border border-border/40 bg-background/10 text-background"
              : "border border-border bg-muted/40 text-foreground",
            {
              "text-secondary": mobileOpen,
            },
          )}
        >
          <HugeiconsIcon
            icon={mobileOpen ? Cancel01Icon : Menu01Icon}
            size={20}
          />
        </button>
      </div>

      {/* Mobile Full-Screen Overlay (Pure CSS Transitions) */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-background backdrop-blur-2xl transition-all duration-300 ease-in-out md:hidden pt-24 px-6 pb-8",
          mobileOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-4",
        )}
      >
        <div className="flex flex-col h-full max-w-md mx-auto w-full">
          {/* Integrated Search */}
          <form
            action={(formData) => {
              const search = formData.get('search');
              if (search && String(search).trim().length >= 2) {
                window.location.href = `/products?search=${encodeURIComponent(String(search).trim())}`;
              }
            }}
            className="relative mb-6"
          >
            <div className="flex items-center gap-2 rounded-full bg-muted/40 px-4 py-2.5 border">
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

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 overflow-auto">
            <CategoriesMegaMenu
              isHero={isHero}
              isActive={isActive}
              onMobileLinkClick={() => setMobileOpen(false)}
              mobileOpen={mobileOpen}
            />
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-5 py-3 text-xl font-medium transition-all",
                  isActive(href)
                    ? "text-secondary text-3xl font-bold"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>{label}</span>
                {isActive(href) && (
                  <HugeiconsIcon
                    icon={Idea01Icon}
                    size={30}
                    className="text-gold"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom CTA Row */}
          <div
            className={cn(
              "pt-6 border-t border-border/40 grid grid-cols-2 gap-3 mt-auto",
              !IS_PHASE_2 && "hidden",
            )}
          >
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
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
              onClick={() => setMobileOpen(false)}
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

export function PageHeader() {
  return <SiteHeader variant="page" />;
}
