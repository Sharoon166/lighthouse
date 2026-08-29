"use client";

import {
  Cancel01Icon,
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

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/sale", label: "Sale" },
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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "z-50 w-full",
        isHero
          ? "absolute top-0 py-4"
          : "static bg-background py-3",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="relative z-50 flex items-center gap-2 shrink-0"
        >
          <LogoImage dark={variant == "page" || mobileOpen} />
        </Link>

        {/* Desktop nav — centered pill */}
        <nav
          className={cn(
            "hidden items-center gap-1 rounded-full px-2 py-1 md:flex",
            isHero
              ? "border border-border/40 bg-muted/10"
              : "border border-border bg-muted/40",
          )}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary text-primary-foreground"
                  : isHero
                    ? "text-background hover:bg-muted hover:text-foreground"
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
            "hidden items-center gap-1 rounded-full px-2 py-1 md:flex",
            isHero
              ? "border border-border/40 bg-muted/10"
              : "border border-border bg-muted/40",
          )}
        >
          <button
            type="button"
            aria-label="Search"
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
              isHero
                ? "text-background hover:text-foreground"
                : "text-foreground",
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
        <div className="flex flex-col justify-between h-full max-w-md mx-auto w-full">
          {/* Integrated Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full border border-border/60 bg-muted/40 px-10 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              className="absolute left-3.5 top-3 text-muted-foreground"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-5 py-3 text-xl font-medium transition-all",
                  isActive(href)
                    ? "text-secondary text-3xl"
                    : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom CTA Row */}
          <div className="pt-6 border-t border-border/40 grid grid-cols-2 gap-3 mt-auto">
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
