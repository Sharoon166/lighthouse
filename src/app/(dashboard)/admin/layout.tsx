import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConfirmProvider } from "@/components/shared/confirm-provider";
import { CommandPaletteProvider } from "@/components/shared/command-palette";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard · Lighthouse",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="dashboard">
      <CommandPaletteProvider>
        <DashboardShell>
          <ConfirmProvider>{children}</ConfirmProvider>
        </DashboardShell>
      </CommandPaletteProvider>
    </div>
  );
}
