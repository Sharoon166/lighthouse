"use client";

import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import type { ProjectListItem } from "../actions";

export function ProjectCards({
  projects,
  onDelete,
}: {
  projects: ProjectListItem[];
  onDelete?: (project: ProjectListItem) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <article
          key={project.id}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card overflow-hidden transition-colors hover:border-ring"
        >
          {project.heroImage ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={project.heroImage.url}
                alt={project.title}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="relative aspect-[16/9] w-full bg-muted" />
          )}

          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {project.featured && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    ★ Featured
                  </Badge>
                )}
                {project.categories.slice(0, 2).map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
                {project.categories.length > 2 && (
                  <Badge variant="outline">+{project.categories.length - 2}</Badge>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StatusBadge status={project.projectStatus} />
                <Link
                  href={`/admin/projects/edit/${project.slug}`}
                  aria-label={`Edit ${project.title}`}
                  title="Edit"
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <HugeiconsIcon icon={Edit02Icon} size={16} />
                </Link>
                {onDelete && (
                  <button
                    type="button"
                    aria-label={`Delete ${project.title}`}
                    title="Delete"
                    onClick={() => onDelete(project)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
                      "hover:bg-destructive/10 hover:text-destructive",
                    )}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </button>
                )}
                <StatusBadge status={project.status} />
              </div>
            </div>

            <Link href={`/admin/projects/edit/${project.slug}`} className="group">
              <h3 className="font-heading text-lg leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                {project.title}
              </h3>
              {project.subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.subtitle}
                </p>
              )}
            </Link>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                {project.client && (
                  <span className="truncate text-xs font-medium text-foreground">
                    {project.client}
                  </span>
                )}
                {project.location && (
                  <span className="truncate text-xs text-muted-foreground">
                    {project.location}
                  </span>
                )}
              </div>
              <time className="shrink-0 text-xs text-muted-foreground">
                {formatDate(project.updatedAt)}
              </time>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
