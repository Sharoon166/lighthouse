import type { Metadata } from "next";

import { ProjectTrashManager } from "@/features/projects/components/project-trash-manager";
import { listTrashedProjects } from "@/features/projects/actions";

export const metadata: Metadata = {
  title: "Trash · Lighthouse",
};

export default async function ProjectTrashPage() {
  const data = await listTrashedProjects({ page: 1, pageSize: 12 });

  return <ProjectTrashManager initialData={data} />;
}
