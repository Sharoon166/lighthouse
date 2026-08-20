import type { Metadata } from "next";

import { ProductsManager } from "@/features/shop/components/products-manager";
import { listProducts } from "@/features/shop/actions/product-actions";

export const metadata: Metadata = {
  title: "Products · Lighthouse",
};

export default async function ProductsPage() {
  const data = await listProducts({ page: 1, pageSize: 20 });

  return <ProductsManager initialData={data} />;
}
