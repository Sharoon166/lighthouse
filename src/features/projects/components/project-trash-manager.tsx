"use client";

import {
  ArrowLeft02Icon,
  Delete02Icon,
  RestoreBinIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import {
  type ProjectListItem,
  type ProjectListResult,
  listTrashedProjects,
  permanentlyDeleteProject,
  restoreProject,
} from "../actions";

const SKELETON_KEYS = ["one", "two", "three", "four", "five"];

export function ProjectTrashManager({ initialData }: { initialData?: ProjectListResult }) {
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [data, setData] = useState<ProjectListResult | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const skipInitialFetch = useRef(Boolean(initialData));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setError(null);

    listTrashedProjects({ page, pageSize, search: debouncedSearch })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the trash. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch]);

  const refresh = async () => {
    const result = await listTrashedProjects({
      page,
      pageSize,
      search: debouncedSearch,
    });
    setData(result);
  };

  const handleRestore = async (project: ProjectListItem) => {
    setActionError(null);
    setIsBusy(true);
    const result = await restoreProject(project.slug);
    setIsBusy(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not restore this project.");
      return;
    }
    await refresh();
  };

  const handleDeleteForever = async (project: ProjectListItem) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Delete this project forever?",
      description: (
        <>
          "{project.title}", its hero image, and all gallery images will be
          permanently removed. This cannot be undone. Type the project title to
          confirm.
        </>
      ),
      confirmLabel: "Delete forever",
      cancelLabel: "Cancel",
      danger: true,
      matchText: project.title,
      matchLabel: "Type the project title to confirm",
    });

    if (!confirmed) return;

    setIsBusy(true);
    const result = await permanentlyDeleteProject(project.slug);
    setIsBusy(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not delete this project.");
      return;
    }
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/projects"
              aria-label="Back to projects"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
            </Link>
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                Trash
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Restore a project or delete it forever.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/projects"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          All projects
        </Link>
      </div>

      <InputGroup className="h-10 w-full rounded-full bg-card md:w-72">
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} size={16} />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search trash…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10"
        />
      </InputGroup>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{actionError}</span>
          <button
            type="button"
            className="font-medium underline underline-offset-2 hover:text-foreground"
            onClick={() => setActionError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading && !data ? (
        <div className="space-y-3" aria-hidden="true">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="h-20 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : data && data.projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-sm text-muted-foreground">
            {debouncedSearch
              ? "No trashed projects match your search."
              : "The trash is empty. Deleted projects end up here."}
          </p>
        </div>
      ) : (
        data && (
          <>
            <div
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card",
                isLoading && "pointer-events-none opacity-60",
              )}
            >
              <ul className="divide-y divide-border">
                {data.projects.map((project) => (
                  <li
                    key={project.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {project.heroImage ? (
                        <div className="relative aspect-[16/9] w-24 shrink-0 overflow-hidden rounded-lg border border-border">
                          <Image
                            src={project.heroImage.url}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[16/9] w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                          <HugeiconsIcon icon={RestoreBinIcon} size={18} />
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
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={project.projectStatus} />
                        <StatusBadge status={project.status} />
                        <span className="text-xs text-muted-foreground">
                          Trashed{" "}
                          {project.deletedAt ? formatDate(project.deletedAt) : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Restore ${project.title}`}
                          title="Restore"
                          disabled={isBusy}
                          onClick={() => void handleRestore(project)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        >
                          <HugeiconsIcon icon={RestoreBinIcon} size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${project.title} forever`}
                          title="Delete forever"
                          disabled={isBusy}
                          onClick={() => void handleDeleteForever(project)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.pageSize}
              pageSizeOptions={[12, 24, 48]}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
              onPageChange={setPage}
            />
          </>
        )
      )}
    </div>
  );
}
