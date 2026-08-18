import type { Metadata } from "next";

import { CategoriesManager } from "@/features/shop/components/categories-manager";

export const metadata: Metadata = {
  title: "Categories · Lighthouse",
};

export default function CategoriesPage() {
  return <CategoriesManager />;
}
