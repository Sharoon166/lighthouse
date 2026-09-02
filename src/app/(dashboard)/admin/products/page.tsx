import type { Metadata } from "next";
import { listProducts } from "@/features/shop/actions/product-actions";
import { ProductsManager } from "@/features/shop/components/products-manager";

export const metadata: Metadata = {
  title: "Products · Lighthouse",
};

export default async function ProductsPage() {
  const data = await listProducts({ page: 1, pageSize: 20 });

  return <ProductsManager initialData={data} />;
}
