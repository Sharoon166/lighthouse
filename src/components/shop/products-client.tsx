"use client";

import { QuickViewProvider } from "@/components/shop/quick-view";
import type { ReactNode } from "react";

export function ProductsClient({ children }: { children: ReactNode }) {
  return <QuickViewProvider>{children}</QuickViewProvider>;
}
