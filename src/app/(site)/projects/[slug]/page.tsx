import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CTA } from "@/components/hero/cta";
import { getProject, getRelatedProjects } from "@/features/projects/actions";
import { ProjectDetail } from "@/features/projects/components/project-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.seo.metaTitle || `${project.title} | Lighthouse`,
    description:
      project.seo.metaDescription ||
      project.subtitle ||
      `View ${project.title} lighting project by Lighthouse`,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project || project.status !== "published") {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(slug, project.categories, 3);

  return (
    <>
      <ProjectDetail project={project} relatedProjects={relatedProjects} />
      <div className="container">
        <CTA />
      </div>
    </>
  );
}
