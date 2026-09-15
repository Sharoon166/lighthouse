import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllAttributeDefinitions } from "@/features/shop/actions/attribute-definition-actions";
import {
  flattenCategoryTree,
  getCategoryById,
  getCategoryTree,
} from "@/features/shop/actions/category-actions";
import { CategoryForm } from "@/features/shop/components/category-form";

export const metadata: Metadata = {
  title: "Edit category · Lighthouse",
};

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const [category, tree, allAttributes] = await Promise.all([
    getCategoryById(id),
    getCategoryTree(),
    getAllAttributeDefinitions(),
  ]);

  if (!category) notFound();

  const serializedCategory = JSON.parse(JSON.stringify(category));
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
      mode="edit"
      id={id}
      initialData={serializedCategory as never}
      allCategories={allCategories}
      allAttributes={allAttributes}
    />
  );
}
