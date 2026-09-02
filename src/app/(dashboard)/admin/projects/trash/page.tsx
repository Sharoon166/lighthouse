import type { Metadata } from "next";
import { listTrashedProjects } from "@/features/projects/actions";
import { ProjectTrashManager } from "@/features/projects/components/project-trash-manager";

export const metadata: Metadata = {
  title: "Trash · Lighthouse",
};

export default async function ProjectTrashPage() {
  const data = await listTrashedProjects({ page: 1, pageSize: 12 });

  return <ProjectTrashManager initialData={data} />;
}
