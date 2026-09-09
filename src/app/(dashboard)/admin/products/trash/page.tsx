import type { Metadata } from "next";
import { listTrashedProducts } from "@/features/shop/actions/product-actions";
import { ProductTrashManager } from "@/features/shop/components/product-trash-manager";

export const metadata: Metadata = {
  title: "Trash · Lighthouse",
};

export default async function ProductTrashPage() {
  const data = await listTrashedProducts({ page: 1, pageSize: 20 });

  return <ProductTrashManager initialData={data} />;
}
