import type { Metadata } from "next";

import { CategoryForm } from "@/features/shop/components/category-form";
import {
  getAllCategoriesAdmin,
} from "@/features/shop/actions/category-actions";
import { getAllActiveAttributeDefinitions } from "@/features/shop/actions/attribute-definition-actions";

export const metadata: Metadata = {
  title: "New category · Lighthouse",
};

export default async function NewCategoryPage() {
  const [allCategories, allAttributes] = await Promise.all([
    getAllCategoriesAdmin(),
    getAllActiveAttributeDefinitions(),
  ]);

  return (
    <CategoryForm
      mode="create"
      allCategories={allCategories}
      allAttributes={allAttributes}
    />
  );
}
