"use client";

import {
  Delete02Icon,
  Edit02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { ProjectListItem } from "../actions";

export function ProjectCards({
  projects,
  onDelete,
  onToggleFeatured,
  canFeatureMore,
}: {
  projects: ProjectListItem[];
  onDelete?: (project: ProjectListItem) => void;
  onToggleFeatured?: (project: ProjectListItem) => void;
  canFeatureMore?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <article
          key={project.id}
          className="group/card flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-colors hover:border-ring"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            {project.heroImage ? (
              <Image
                src={project.heroImage.url}
                alt={project.title}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover/card:scale-105"
              />
            ) : null}

            {/* Actions overlay */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-background/80 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover/card:opacity-100">
              {onToggleFeatured && (
                <button
                  type="button"
                  aria-label={
                    project.featured
                      ? `Unfeature ${project.title}`
                      : `Feature ${project.title}`
                  }
                  title={
                    project.featured
                      ? "Remove from featured"
                      : canFeatureMore
                        ? "Add to featured"
                        : "Featured limit reached"
                  }
                  disabled={!project.featured && !canFeatureMore}
                  onClick={() => onToggleFeatured(project)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md transition-colors",
                    project.featured
                      ? "text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    !project.featured &&
                      !canFeatureMore &&
                      "cursor-not-allowed opacity-40",
                  )}
                >
                  <HugeiconsIcon icon={StarIcon} size={14} />
                </button>
              )}
              <Link
                href={`/admin/projects/edit/${project.slug}`}
                aria-label={`Edit ${project.title}`}
                title="Edit"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Edit02Icon} size={14} />
              </Link>
              {onDelete && (
                <button
                  type="button"
                  aria-label={`Delete ${project.title}`}
                  title="Delete"
                  onClick={() => onDelete(project)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </button>
              )}
            </div>

            {/* Featured indicator */}
            {project.featured && (
              <div className="absolute top-2.5 left-2.5">
                <div className="flex size-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                  <HugeiconsIcon icon={StarIcon} size={12} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex flex-wrap gap-1.5">
              {project.categories.slice(0, 2).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[11px]">
                  {cat}
                </Badge>
              ))}
              {project.categories.length > 2 && (
                <Badge variant="outline" className="text-[11px]">
                  +{project.categories.length - 2}
                </Badge>
              )}
            </div>

            <Link
              href={`/admin/projects/edit/${project.slug}`}
              className="group/title"
            >
              <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover/title:text-primary">
                {project.title}
              </h3>
              {project.subtitle && (
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                  {project.subtitle}
                </p>
              )}
            </Link>

            <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              {project.client && (
                <span className="truncate">{project.client}</span>
              )}
              {project.client && project.location && (
                <span className="text-border">·</span>
              )}
              {project.location && (
                <span className="truncate">{project.location}</span>
              )}
              <time className="ml-auto shrink-0 text-[11px]">
                {formatDate(project.updatedAt)}
              </time>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
