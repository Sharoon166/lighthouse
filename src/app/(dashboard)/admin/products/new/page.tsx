import type { Metadata } from "next";
import { getAllBrands } from "@/features/shop/actions/brand-actions";
import { getAllCategoriesAdmin } from "@/features/shop/actions/category-actions";
import { ProductForm } from "@/features/shop/components/product-form";

export const metadata: Metadata = {
  title: "New product · Lighthouse",
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getAllCategoriesAdmin(),
    getAllBrands(),
  ]);

  return <ProductForm mode="create" categories={categories} brands={brands} />;
}
