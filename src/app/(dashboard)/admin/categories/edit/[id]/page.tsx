import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllAttributeDefinitions } from "@/features/shop/actions/attribute-definition-actions";
import {
  getAllCategoriesAdmin,
  getCategoryById,
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
  const [category, allCategories, allAttributes] = await Promise.all([
    getCategoryById(id),
    getAllCategoriesAdmin(),
    getAllAttributeDefinitions(),
  ]);

  if (!category) notFound();

  const serializedCategory = JSON.parse(JSON.stringify(category));

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
