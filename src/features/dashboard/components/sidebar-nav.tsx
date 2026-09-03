"use client";

import {
  DashboardSquare03Icon,
  Folder02Icon,
  LogoutIcon,
  NewsIcon,
  PackageIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  Settings01Icon,
  Settings04Icon,
  Store01Icon,
  TagsIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function SidebarNav({ navigate }: { navigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const name = user?.name || "Admin";
  const email = user?.email || "";
  const [collapsed, setCollapsed] = useLocalStorage(
    "lighthouse:sidebar-collapsed",
    true,
  );

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  function handleSignOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/admin/login";
        },
      },
    });
  }

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
            onClick={navigate}
            aria-label="Lighthouse dashboard"
            className="flex items-center gap-2.5 font-heading text-2xl text-secondary font-semibold"
          >
            Lighthouse
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon
            icon={collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon}
            size={18}
          />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={navigate}
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

      <Separator className="mx-auto" />

      <nav className="flex flex-col gap-1">
        <Link
          href="/admin/settings"
          onClick={navigate}
          aria-label={collapsed ? "Settings" : undefined}
          className={itemClasses(collapsed, pathname === "/admin/settings")}
        >
          <HugeiconsIcon icon={Settings01Icon} size={18} className="shrink-0" />
          <span className={cn(collapsed && "hidden")}>Settings</span>
          {collapsed && <Tooltip label="Settings" />}
        </Link>
      </nav>

      {/* Avatar dropdown */}
      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted",
              collapsed && "justify-center p-2 border-0",
            )}
          >
            <Avatar>
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
            )}
            {collapsed && (
              <Tooltip
                label={`${name} · ${email}`}
                className="max-w-52 truncate"
              />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? "start" : "center"}
            side={collapsed ? "right" : "top"}
            sideOffset={8}
          >
            {!collapsed && (
              <DropdownMenuGroup>
                <div className="px-2.5 py-2">
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
              </DropdownMenuGroup>
            )}
            {!collapsed && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={navigate}>
                <HugeiconsIcon icon={UserCircleIcon} size={16} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={navigate}>
                <Link href="/admin/settings" className="flex items-center gap-2">
                  <HugeiconsIcon icon={Settings01Icon} size={16} />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <HugeiconsIcon icon={LogoutIcon} size={16} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
