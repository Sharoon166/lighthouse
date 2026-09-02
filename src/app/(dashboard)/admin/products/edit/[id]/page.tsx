import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBrands } from "@/features/shop/actions/brand-actions";
import { getAllCategoriesAdmin } from "@/features/shop/actions/category-actions";
import { getProductById } from "@/features/shop/actions/product-actions";
import { ProductForm } from "@/features/shop/components/product-form";

export const metadata: Metadata = {
  title: "Edit product · Lighthouse",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    getAllCategoriesAdmin(),
    getAllBrands(),
  ]);

  if (!product) notFound();

  const serializedProduct = JSON.parse(JSON.stringify(product));

  return (
    <ProductForm
      mode="edit"
      id={id}
      initialData={serializedProduct}
      categories={categories}
      brands={brands}
    />
  );
}
