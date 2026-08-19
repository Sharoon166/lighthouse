import type { Metadata } from "next";
import { AttributeDefinitionForm } from "@/features/shop/components/attribute-definition-form";

export const metadata: Metadata = {
  title: "New attribute · Lighthouse",
};

export default function NewAttributePage() {
  return <AttributeDefinitionForm mode="create" />;
}
