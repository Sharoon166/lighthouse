import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/features/shop/components/category-form";
import {
  getCategoryById,
  getAllCategoriesAdmin,
} from "@/features/shop/actions/category-actions";

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
  const [category, allCategories] = await Promise.all([
    getCategoryById(id),
    getAllCategoriesAdmin(),
  ]);

  if (!category) notFound();

  return (
    <CategoryForm
      mode="edit"
      id={id}
      initialData={category as never}
      allCategories={allCategories}
    />
  );
}
