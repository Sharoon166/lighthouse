import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConfirmProvider } from "@/components/shared/confirm-provider";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard · Lighthouse",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell adminName="Sara Ahmed" adminEmail="sara@lighthouse.pk">
      <ConfirmProvider>{children}</ConfirmProvider>
    </DashboardShell>
  );
}
