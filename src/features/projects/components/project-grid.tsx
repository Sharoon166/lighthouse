"use client";

import { FolderOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ProjectCard, type ProjectItem } from "./project-card";
import { ProjectFilters } from "./project-filters";

export function ProjectGrid({ projects }: { projects: ProjectItem[] }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) => {
    const matchesCategory =
      category === "all" || p.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <ProjectFilters
        activeCategory={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        count={filtered.length}
      />
      <div className="container pb-12 md:pb-16">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                className="aspect-3/2"
              />
            ))}
          </div>
        ) : (
          <Empty className="rounded-2xl border border-border bg-card py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={FolderOpenIcon} size={24} />
          </EmptyMedia>
          <EmptyTitle>No projects found</EmptyTitle>
          <EmptyDescription>Try a different search or category.</EmptyDescription>
        </EmptyHeader>
      </Empty>
        )}
      </div>
    </>
  );
}
