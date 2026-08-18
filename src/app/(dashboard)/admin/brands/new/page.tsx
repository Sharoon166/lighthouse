import type { Metadata } from "next";

import { BrandForm } from "@/features/shop/components/brand-form";

export const metadata: Metadata = {
  title: "New brand · Lighthouse",
};

export default function NewBrandPage() {
  return <BrandForm mode="create" />;
}
