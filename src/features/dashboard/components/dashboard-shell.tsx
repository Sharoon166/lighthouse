"use client";

import { type ReactNode, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "./dashboard-header";
import { SidebarNav } from "./sidebar-nav";

export function DashboardShell({
  children,
  adminName,
  adminEmail,
}: {
  children: ReactNode;
  adminName: string;
  adminEmail: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage(
    "lighthouse:dashboard-sidebar-collapsed",
    true,
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 p-4 md:gap-10 md:p-8 lg:p-10">
        <aside
          className={cn(
            "sticky top-8 hidden h-[calc(100dvh-4rem)] shrink-0 self-start rounded-2xl border border-border bg-card transition-[width] duration-300 ease-in-out lg:block",
            collapsed ? "w-16" : "w-60",
          )}
        >
          <SidebarNav
            adminName={adminName}
            adminEmail={adminEmail}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((value) => !value)}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <DashboardHeader
            adminName={adminName}
            onMenuClick={() => setMobileOpen(true)}
          />
          <main className="mt-8 pb-16">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-card shadow-xl">
            <SidebarNav
              adminName={adminName}
              adminEmail={adminEmail}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
