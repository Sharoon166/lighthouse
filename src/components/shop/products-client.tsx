"use client";

import type { ReactNode } from "react";
import { QuickViewProvider } from "@/components/shop/quick-view";

export function ProductsClient({ children }: { children: ReactNode }) {
  return <QuickViewProvider>{children}</QuickViewProvider>;
}
