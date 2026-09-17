"use client";

import { FolderOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Pagination } from "@/components/shared/pagination";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ProjectCard, type ProjectItem } from "./project-card";
import { ProjectFilters } from "./project-filters";

const PAGE_SIZE = 9;

export function ProjectGrid({ projects }: { projects: ProjectItem[] }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = projects.filter((p) => {
    const matchesCategory =
      category === "all" || p.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to page 1 when filters change
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <>
      <ProjectFilters
        activeCategory={category}
        onCategoryChange={handleCategoryChange}
        search={search}
        onSearchChange={handleSearchChange}
        count={filtered.length}
      />
      <div className="container pb-12 md:pb-16">
        {paginatedProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProjects.map((project) => (
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
              <EmptyDescription>
                Try a different search or category.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
