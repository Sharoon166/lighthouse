import type { Metadata } from "next";

import { CategoryForm } from "@/features/shop/components/category-form";
import { getAllCategoriesAdmin } from "@/features/shop/actions/category-actions";

export const metadata: Metadata = {
  title: "New category · Lighthouse",
};

export default async function NewCategoryPage() {
  const allCategories = await getAllCategoriesAdmin();

  return <CategoryForm mode="create" allCategories={allCategories} />;
}
