import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CTA } from "@/components/hero/cta";
import { getProject, getRelatedProjects } from "@/features/projects/actions";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { generateSeoMetadata } from "@/lib/seo-helpers";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found | Lighthouse" };

  return generateSeoMetadata({
    title: project.seo.metaTitle || `${project.title} | Lighthouse`,
    description:
      project.seo.metaDescription ||
      project.subtitle ||
      `View ${project.title} lighting project by Lighthouse.`,
    path: `/projects/${project.slug}`,
    image: project.heroImage?.url,
    noIndex: project.seo.noIndex,
    keywords: project.seo.focusKeyword
      ? [project.seo.focusKeyword, ...project.categories]
      : project.categories,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project || project.status !== "published") {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(slug, project.categories, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lighthouse.pk";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.subtitle || project.seo.metaDescription,
    image: project.heroImage?.url,
    url: `${siteUrl}/projects/${project.slug}`,
    author: {
      "@type": "Organization",
      name: "Lighthouse",
    },
    keywords: project.categories.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetail project={project} relatedProjects={relatedProjects} />
      <div className="container">
        <CTA />
      </div>
    </>
  );
}
