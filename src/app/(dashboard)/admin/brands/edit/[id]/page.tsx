import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandForm } from "@/features/shop/components/brand-form";
import { getBrandById } from "@/features/shop/actions/brand-actions";

export const metadata: Metadata = {
  title: "Edit brand · Lighthouse",
};

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) notFound();

  const serializedBrand = JSON.parse(JSON.stringify(brand));

  return <BrandForm mode="edit" id={id} initialData={serializedBrand as never} />;
}
