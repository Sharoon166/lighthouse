import type { Metadata } from "next";

import { ProjectTrashManager } from "@/features/projects/components/project-trash-manager";

export const metadata: Metadata = {
  title: "Trash · Lighthouse",
};

export default function ProjectTrashPage() {
  return <ProjectTrashManager />;
}
