"use client";

import Link from "next/link";
import type { DashboardStats } from "../actions";

export function DashboardFeatured({
  featured,
}: {
  featured: DashboardStats["featuredContent"];
}) {
  if (!featured.blog && featured.projects.length === 0) return null;

  return (
    <div>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Featured
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.blog && (
          <Link
            href={`/admin/blog/edit/${featured.blog.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-ring hover:shadow-sm"
          >
            <div className="absolute -bottom-8 -right-8 size-24 rounded-full bg-chart-4/4 blur-xl" />
            <div className="relative flex items-start gap-4">
              {featured.blog.image ? (
                <img
                  src={featured.blog.image}
                  alt=""
                  className="size-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="size-14 shrink-0 rounded-xl bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-chart-4">
                  Blog
                </p>
                <p className="mt-1 truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {featured.blog.title}
                </p>
              </div>
            </div>
          </Link>
        )}

        {featured.projects.map((project) => (
          <Link
            key={project.slug}
            href={`/admin/projects/edit/${project.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-ring hover:shadow-sm"
          >
            <div className="absolute -bottom-8 -right-8 size-24 rounded-full bg-chart-3/4 blur-xl" />
            <div className="relative flex items-start gap-4">
              {project.image ? (
                <img
                  src={project.image}
                  alt=""
                  className="size-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="size-14 shrink-0 rounded-xl bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-chart-3">
                  Project
                </p>
                <p className="mt-1 truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {project.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
