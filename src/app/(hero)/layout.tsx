import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function HeroLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader variant="hero" />
      {children}
      <SiteFooter />
    </>
  );
}
