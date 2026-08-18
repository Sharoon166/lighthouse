import type { Metadata } from "next";

import { ProductsManager } from "@/features/shop/components/products-manager";

export const metadata: Metadata = {
  title: "Products · Lighthouse",
};

export default function ProductsPage() {
  return <ProductsManager />;
}
