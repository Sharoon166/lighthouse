import type { Metadata } from "next";
import { Tenor_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { ConfirmProvider } from "@/components/shared/confirm-provider";
import { CommandPaletteProvider } from "@/components/shared/command-palette";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { requireDashboardAccess } from "@/lib/require-role";

export const metadata: Metadata = {
  title: "Dashboard · Lighthouse",
};

const tenorSans = Tenor_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tenor-sans",
});

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDashboardAccess();

  return (
    <div data-theme="dashboard" className={tenorSans.variable}>
      <CommandPaletteProvider>
        <DashboardShell>
          <ConfirmProvider>{children}</ConfirmProvider>
        </DashboardShell>
      </CommandPaletteProvider>
    </div>
  );
}
