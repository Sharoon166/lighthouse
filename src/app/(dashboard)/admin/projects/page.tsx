import type { Metadata } from "next";

import { ProjectsManager } from "@/features/projects/components/projects-manager";

export const metadata: Metadata = {
  title: "Projects · Lighthouse",
};

export default function ProjectsPage() {
  return <ProjectsManager />;
}
