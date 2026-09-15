import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBrands } from "@/features/shop/actions/brand-actions";
import {
  flattenCategoryTree,
  getCategoryTree,
} from "@/features/shop/actions/category-actions";
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
  const [product, tree, brands] = await Promise.all([
    getProductById(id),
    getCategoryTree(),
    getAllBrands(),
  ]);

  if (!product) notFound();

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const categories = (await flattenCategoryTree(tree)).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    level: c.level,
    ancestors: c.ancestors,
  }));

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
