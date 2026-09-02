import type { Metadata } from "next";
import { listAttributeDefinitions } from "@/features/shop/actions/attribute-definition-actions";
import { AttributesManager } from "@/features/shop/components/attributes-manager";

export const metadata: Metadata = {
  title: "Attributes · Lighthouse",
};

export default async function AttributesPage() {
  const data = await listAttributeDefinitions({
    page: 1,
    pageSize: 20,
    showAll: true,
  });

  return <AttributesManager initialData={data} />;
}
