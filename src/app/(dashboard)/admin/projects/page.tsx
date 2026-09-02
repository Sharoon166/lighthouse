import type { Metadata } from "next";
import { listProjects } from "@/features/projects/actions";
import { ProjectsManager } from "@/features/projects/components/projects-manager";

export const metadata: Metadata = {
  title: "Projects · Lighthouse",
};

export default async function ProjectsPage() {
  const data = await listProjects({ page: 1, pageSize: 12 });

  return <ProjectsManager initialData={data} />;
}
