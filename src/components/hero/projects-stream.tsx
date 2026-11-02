"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { use } from "react";
import { SectionHeader } from "@/components/shared/section-header";
import type { HomepageProject } from "@/lib/homepage-data";
import { cn } from "@/lib/utils";

function ProjectGrid({ projects }: { projects: HomepageProject[] }) {
  if (projects.length === 0) return null;

  // The mosaic (large tile + two stacked tiles) only works with exactly 3
  // items — anything else falls back to full-width bands so it never breaks.
  const isMosaic = projects.length === 3;

  return (
    <section className="bg-muted mb-0">
      <div className="container">
        <SectionHeader
          title="Lighting That Transforms Every Space"
          description="Explore a selection of residential and commercial projects featuring our premium lighting solutions, designed to enhance ambience, functionality and style."
          ctaText="View all Projects"
          ctaHref="/projects"
        />
        <div className={cn("grid grid-cols-5 gap-4", isMosaic && "md:h-136")}>
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              style={
                project.image
                  ? { backgroundImage: `url(${project.image})` }
                  : undefined
              }
              className={cn(
                "border bg-muted bg-cover p-4 place-content-end",
                isMosaic
                  ? "col-span-2 max-md:col-span-5 max-md:aspect-3/2"
                  : "col-span-5 aspect-3/2",
                isMosaic && index === 0 && "md:col-span-3 md:row-span-2",
              )}
            >
              <h3 className="text-2xl font-bold text-primary">
                {project.title}
              </h3>
              <div className="flex items-center gap-4 text-gold">
                <p>{project.subtitle}</p>
                <HugeiconsIcon icon={ArrowRight02Icon} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Streaming wrapper — unwraps the projects promise with `use()`.
 * Suspense in the parent handles the loading state.
 */
export function ProjectsStream({
  promise,
}: {
  promise: Promise<HomepageProject[]>;
}) {
  const projects = use(promise);
  return <ProjectGrid projects={projects} />;
}

/**
 * Fallback — renders the same grid with static fallback data.
 */
export function ProjectsFallback({
  projects,
}: {
  projects: HomepageProject[];
}) {
  return <ProjectGrid projects={projects} />;
}
