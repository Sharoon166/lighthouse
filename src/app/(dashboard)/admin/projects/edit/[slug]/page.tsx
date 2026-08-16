import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject } from "@/features/projects/actions";
import { ProjectForm } from "@/features/projects/components/project-form";

export const metadata: Metadata = {
  title: "Edit Project · Lighthouse",
};

interface EditProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  return <ProjectForm mode="edit" initialData={project} />;
}
