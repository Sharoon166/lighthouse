import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AttributeDefinitionForm } from "@/features/shop/components/attribute-definition-form";
import { getAttributeDefinitionById } from "@/features/shop/actions/attribute-definition-actions";

export const metadata: Metadata = {
  title: "Edit attribute · Lighthouse",
};

interface EditAttributePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAttributePage({
  params,
}: EditAttributePageProps) {
  const { id } = await params;
  const attribute = await getAttributeDefinitionById(id);

  if (!attribute) notFound();

  return (
    <AttributeDefinitionForm mode="edit" id={id} initialData={attribute as never} />
  );
}
