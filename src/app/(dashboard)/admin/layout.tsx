import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConfirmProvider } from "@/components/shared/confirm-provider";
import { CommandPaletteProvider } from "@/components/shared/command-palette";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { Poiret_One } from "next/font/google";

export const metadata: Metadata = {
  title: "Dashboard · Lighthouse",
};

const poiretOne = Poiret_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poiret-one",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="dashboard" className={poiretOne.variable}>
      <CommandPaletteProvider>
        <DashboardShell>
          <ConfirmProvider>{children}</ConfirmProvider>
        </DashboardShell>
      </CommandPaletteProvider>
    </div>
  );
}
