"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CommandPaletteTrigger } from "@/components/shared/command-palette";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/projects": "Projects",
  "/admin/blog": "Blog",
  "/admin/categories": "Categories",
  "/admin/media": "Media",
  "/admin/settings": "Settings",
};

export function DashboardHeader({ menuClick }: { menuClick: () => void }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || "Admin";

  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? "Good night"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : hour < 21
            ? "Good evening"
            : "Good night";

  const isHome = pathname === "/admin";
  const title = isHome ? `${greeting}, ` : (TITLES[pathname] ?? "Dashboard");

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={menuClick}
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
        <CommandPaletteTrigger />
      </div>
    </header>
  );
}
