import type { Metadata } from "next";

import { ProjectForm } from "@/features/projects/components/project-form";

export const metadata: Metadata = {
  title: "New Project · Lighthouse",
};

export default function NewProjectPage() {
  return <ProjectForm mode="create" />;
}
