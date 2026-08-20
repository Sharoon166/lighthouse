import type { Metadata } from "next";

import { CategoriesManager } from "@/features/shop/components/categories-manager";
import { getCategoryTree } from "@/features/shop/actions/category-actions";

export const metadata: Metadata = {
  title: "Categories · Lighthouse",
};

export default async function CategoriesPage() {
  const tree = await getCategoryTree();

  return <CategoriesManager initialTree={tree} />;
}
