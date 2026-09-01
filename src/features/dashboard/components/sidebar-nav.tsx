"use client";

import {
  DashboardSquare03Icon,
  Folder02Icon,
  Logout02Icon,
  NewsIcon,
  PackageIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  Settings01Icon,
  Settings04Icon,
  Store01Icon,
  TagsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: DashboardSquare03Icon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/categories", label: "Categories", icon: TagsIcon },
  { href: "/admin/brands", label: "Brands", icon: Store01Icon },
  { href: "/admin/attributes", label: "Attributes", icon: Settings04Icon },
  { href: "/admin/projects", label: "Projects", icon: Folder02Icon },
  { href: "/admin/blog", label: "Blog", icon: NewsIcon },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function itemClasses(collapsed: boolean, active: boolean) {
  return cn(
    "group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors",
    collapsed ? "justify-center px-0" : "px-3",
    active
      ? "bg-secondary text-secondary-foreground"
      : "hover:bg-muted hover:text-foreground",
  );
}

function Tooltip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function SidebarNav({
  adminName,
  adminEmail,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: {
  adminName: string;
  adminEmail: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const settingsActive = pathname.startsWith("/admin/settings");

  return (
    <div className="flex h-full flex-col gap-6 p-3">
      <div
        className={cn(
          "flex items-center gap-2 pt-1",
          collapsed ? "flex-col gap-5" : "justify-between px-2",
        )}
      >
        {!collapsed && (
          <Link
            href="/admin"
            onClick={onNavigate}
            aria-label="Lighthouse dashboard"
            className="flex items-center gap-2.5 font-heading text-2xl text-secondary font-semibold"
          >
            Lighthouse
          </Link>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon
              icon={collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon}
              size={18}
            />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-label={collapsed ? item.label : undefined}
              className={itemClasses(collapsed, active)}
            >
              <HugeiconsIcon icon={item.icon} size={18} className="shrink-0" />
              <span className={cn(collapsed && "hidden")}>{item.label}</span>
              {collapsed && <Tooltip label={item.label} />}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-2" />

      <nav className="flex flex-col gap-1">
        <Link
          href="/admin/settings"
          onClick={onNavigate}
          aria-label={collapsed ? "Settings" : undefined}
          className={itemClasses(collapsed, settingsActive)}
        >
          <HugeiconsIcon icon={Settings01Icon} size={18} className="shrink-0" />
          <span className={cn(collapsed && "hidden")}>Settings</span>
          {collapsed && <Tooltip label="Settings" />}
        </Link>
        <button
          type="button"
          aria-label={collapsed ? "Logout" : undefined}
          className={itemClasses(collapsed, false)}
        >
          <HugeiconsIcon icon={Logout02Icon} size={18} className="shrink-0" />
          <span className={cn(collapsed && "hidden")}>Logout</span>
          {collapsed && <Tooltip label="Logout" />}
        </button>
      </nav>

      <div
        className={cn(
          "group relative mt-auto rounded-xl border border-border bg-background",
          collapsed ? "flex justify-center p-2" : "flex items-center gap-3 p-3",
        )}
      >
        <Avatar>
          <AvatarFallback>{initials(adminName)}</AvatarFallback>
        </Avatar>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {adminName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {adminEmail}
            </p>
          </div>
        ) : (
          <Tooltip
            label={`${adminName} · ${adminEmail}`}
            className="max-w-52 truncate"
          />
        )}
      </div>
    </div>
  );
}
