import type { Metadata } from "next";
import { getCategoryTree } from "@/features/shop/actions/category-actions";
import { CategoriesManager } from "@/features/shop/components/categories-manager";

export const metadata: Metadata = {
  title: "Categories · Lighthouse",
};

export default async function CategoriesPage() {
  const tree = await getCategoryTree();

  return <CategoriesManager initialTree={tree} />;
}
