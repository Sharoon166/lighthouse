"use client";

import { BellIcon, Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/projects": "Projects",
  "/admin/blog": "Blog",
  "/admin/categories": "Categories",
  "/admin/media": "Media",
  "/admin/settings": "Settings",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardHeader({
  adminName,
  onMenuClick,
}: {
  adminName: string;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const firstName = adminName.split(" ")[0];
  const title = isHome ? "Good morning, " : (TITLES[pathname] ?? "Dashboard");

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <HugeiconsIcon icon={Menu01Icon} size={18} />
        </Button>
        <div>
          {isHome ? (
            <>
              <h1 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl">
                {title} <span className="text-gold">{firstName}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                Manage your products, projects and stories from one place.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-3xl tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                Manage your products, projects and stories from one place.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <InputGroup className="h-11 w-full rounded-full bg-card md:w-80 pl-2">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={18} />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search content…" className="h-11" />
        </InputGroup>

        <button
          type="button"
          aria-label="Profile"
          className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar className="size-11">
            <AvatarFallback>{initials(adminName)}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
