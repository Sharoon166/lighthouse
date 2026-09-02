"use client";

import { useState } from "react";
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                className="aspect-3/2"
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No projects found.
          </p>
        )}
      </div>
    </>
  );
}
