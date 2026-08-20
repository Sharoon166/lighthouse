import type { Metadata } from "next";

import { BrandsManager } from "@/features/shop/components/brands-manager";
import { listBrands } from "@/features/shop/actions/brand-actions";

export const metadata: Metadata = {
  title: "Brands · Lighthouse",
};

export default async function BrandsPage() {
  const data = await listBrands({ page: 1, pageSize: 20, showAll: true });

  return <BrandsManager initialData={data} />;
}
