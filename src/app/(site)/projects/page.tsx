import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { PageHero } from "@/components/shared/page-hero";
import { getPublishedProjects } from "@/features/projects/actions";
import { FeaturedProjects } from "@/features/projects/components/featured-projects";
import { ProjectGrid } from "@/features/projects/components/project-grid";

export const metadata: Metadata = {
  title: "Projects | Lighthouse",
  description:
    "Explore our lighting projects, where thoughtful design and carefully selected fixtures transform spaces into warm, elegant, and inviting environments.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <PageHero
        title="Our Projects"
        description="Explore our lighting projects, where thoughtful design and carefully selected fixtures transform spaces into warm, elegant, and inviting environments."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Projects" }]}
      />

      <div className="py-12 md:py-16">
        {featured.length > 0 && <FeaturedProjects featured={featured} />}
        <ProjectGrid projects={projects} />
      </div>

      <div className="container">
        <CTA />
      </div>
    </>
  );
}
