"use client";

import Image from "next/image";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date-utils";
import {
  TrashManager,
  type NormalizedTrashResult,
} from "@/components/shared/trash-manager";
import {
  listTrashedProjects,
  permanentlyDeleteProject,
  restoreProject,
  type ProjectListItem,
  type ProjectListResult,
} from "../actions";

const fetchProjectTrashItems = async (input: {
  page: number;
  pageSize: number;
  search: string;
}) => {
  const result = await listTrashedProjects(input);
  return {
    items: result.projects,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
};

export function ProjectTrashManager({
  initialData,
}: {
  initialData?: ProjectListResult;
}) {
  const normalizedInitialData:
    | NormalizedTrashResult<ProjectListItem>
    | undefined = initialData
    ? {
        items: initialData.projects,
        total: initialData.total,
        page: initialData.page,
        pageSize: initialData.pageSize,
        totalPages: initialData.totalPages,
      }
    : undefined;

  return (
    <TrashManager
      fetchItems={fetchProjectTrashItems}
      restoreItem={(project) => restoreProject(project.slug)}
      deleteItem={(project) => permanentlyDeleteProject(project.slug)}
      renderItemContent={(project) => (
        <>
          {project.heroImage ? (
            <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg border border-border">
              <Image
                src={project.heroImage.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
              No image
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {project.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              /{project.slug}
            </p>
          </div>
        </>
      )}
      renderItemMeta={(project) => (
        <>
          <StatusBadge status={project.projectStatus} />
          <StatusBadge status={project.status} />
          <span className="text-xs text-muted-foreground">
            Trashed {project.deletedAt ? formatDate(project.deletedAt) : ""}
          </span>
        </>
      )}
      getItemId={(project) => project.id}
      getItemName={(project) => project.title}
      getDeleteConfirmConfig={(project) => ({
        title: "Delete this project forever?",
        description: (
          <>
            &ldquo;{project.title}&rdquo;, its hero image, and all gallery
            images will be permanently removed. This cannot be undone. Type the
            project title to confirm.
          </>
        ),
        matchText: project.title,
        matchLabel: "Type the project title to confirm",
      })}
      emptyMessage={(search) =>
        search
          ? "No trashed projects match your search."
          : "The trash is empty. Deleted projects end up here."
      }
      initialData={normalizedInitialData}
      defaultPageSize={12}
      pageSizeOptions={[12, 24, 48]}
    />
  );
}
