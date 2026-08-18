import type { Metadata } from "next";

import { BrandsManager } from "@/features/shop/components/brands-manager";

export const metadata: Metadata = {
  title: "Brands · Lighthouse",
};

export default function BrandsPage() {
  return <BrandsManager />;
}
