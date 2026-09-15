import type { Metadata } from "next";
import { getAllBrands } from "@/features/shop/actions/brand-actions";
import {
  flattenCategoryTree,
  getCategoryTree,
} from "@/features/shop/actions/category-actions";
import { ProductForm } from "@/features/shop/components/product-form";

export const metadata: Metadata = {
  title: "New product · Lighthouse",
};

export default async function NewProductPage() {
  const [tree, brands] = await Promise.all([
    getCategoryTree(),
    getAllBrands(),
  ]);
  const categories = (await flattenCategoryTree(tree)).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    level: c.level,
    ancestors: c.ancestors,
  }));

  return <ProductForm mode="create" categories={categories} brands={brands} />;
}
