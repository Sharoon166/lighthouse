import type { Metadata } from "next";
import { listBrands } from "@/features/shop/actions/brand-actions";
import { BrandsManager } from "@/features/shop/components/brands-manager";

export const metadata: Metadata = {
  title: "Brands · Lighthouse",
};

export default async function BrandsPage() {
  const data = await listBrands({ page: 1, pageSize: 20, showAll: true });

  return <BrandsManager initialData={data} />;
}
