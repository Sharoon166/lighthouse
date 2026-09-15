import type { Metadata } from "next";
import { getAllActiveAttributeDefinitions } from "@/features/shop/actions/attribute-definition-actions";
import {
  flattenCategoryTree,
  getCategoryTree,
} from "@/features/shop/actions/category-actions";
import { CategoryForm } from "@/features/shop/components/category-form";

export const metadata: Metadata = {
  title: "New category · Lighthouse",
};

export default async function NewCategoryPage() {
  const [tree, allAttributes] = await Promise.all([
    getCategoryTree(),
    getAllActiveAttributeDefinitions(),
  ]);
  const allCategories = (await flattenCategoryTree(tree)).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    level: c.level,
    parent: c.parentId,
    ancestors: c.ancestors,
  }));

  return (
    <CategoryForm
      mode="create"
      allCategories={allCategories}
      allAttributes={allAttributes}
    />
  );
}
