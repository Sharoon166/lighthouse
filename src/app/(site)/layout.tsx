import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageHeader } from "@/components/layout/site-header";
import { QuickViewProvider } from "@/components/shop/quick-view";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <QuickViewProvider>
      <PageHeader />
      {children}
      <SiteFooter />
    </QuickViewProvider>
  );
}
