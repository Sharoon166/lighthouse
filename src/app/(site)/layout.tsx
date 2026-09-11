import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageHeader } from "@/components/layout/site-header";
import { VideoViewerProvider } from "@/components/shared/video-viewer";
import { QuickViewProvider } from "@/components/shop/quick-view";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <QuickViewProvider>
      <VideoViewerProvider>
        <PageHeader />
        {children}
        <SiteFooter />
      </VideoViewerProvider>
    </QuickViewProvider>
  );
}
