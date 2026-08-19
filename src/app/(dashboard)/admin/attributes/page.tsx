import type { Metadata } from "next";
import { AttributesManager } from "@/features/shop/components/attributes-manager";

export const metadata: Metadata = {
  title: "Attributes · Lighthouse",
};

export default function AttributesPage() {
  return <AttributesManager />;
}
