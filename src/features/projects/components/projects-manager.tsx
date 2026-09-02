"use client";

import {
  Delete02Icon,
  PlusSignIcon,
  Search01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Pagination } from "@/components/ui/pagination";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import {
  deleteProject,
  listProjects,
  type ProjectListItem,
  type ProjectListResult,
  toggleFeaturedProject,
} from "../actions";
import { ProjectCards } from "./project-cards";
import { ProjectTable } from "./project-table";

const MAX_FEATURED = 3;

type ProjectStatus = "all" | "draft" | "published";
type View = "table" | "cards";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "table", label: "Table" },
  { value: "cards", label: "Cards" },
];

const SKELETON_KEYS = ["one", "two", "three", "four", "five", "six"];

function SkeletonGrid() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-hidden="true"
    >
      {SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="h-56 animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}

export function ProjectsManager({
  initialData,
}: {
  initialData?: ProjectListResult;
}) {
  const { confirm } = useConfirm();
  const [view, setView] = useLocalStorage<View>(
    "lighthouse:projects-view",
    "cards",
  );
  const [status, setStatus] = useState<ProjectStatus>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [data, setData] = useState<ProjectListResult | null>(
    initialData ?? null,
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

    listProjects({
      page,
      pageSize,
      search: debouncedSearch,
      status,
      category: "",
    })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load projects. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, status]);

  const handleToggleFeatured = async (project: ProjectListItem) => {
    setActionError(null);
    const result = await toggleFeaturedProject(project.slug);

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setData((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        projects: previous.projects.map((p) =>
          p.slug === project.slug ? { ...p, featured: result.featured } : p,
        ),
      };
    });
  };

  const handleDelete = async (project: ProjectListItem) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Move this project to trash?",
      description: (
        <>
          "{project.title}" will be moved to trash. You can restore it anytime
          or delete it forever from the trash.
        </>
      ),
      confirmLabel: "Move to trash",
      cancelLabel: "Keep project",
      danger: true,
    });

    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteProject(project.slug);
    setIsDeleting(false);

    if (!result.ok) {
      setActionError(result.message ?? "Could not move this project to trash.");
      return;
    }

    const refreshed = await listProjects({
      page,
      pageSize,
      search: debouncedSearch,
      status,
      category: "",
    });
    setData(refreshed);
  };

  const featuredProjects = data?.projects.filter((p) => p.featured) ?? [];
  const canFeatureMore = featuredProjects.length < MAX_FEATURED;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit and manage your project showcases.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/projects/trash"
            className={buttonVariants({ variant: "outline" })}
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} />
            Trash
          </Link>
          <Link href="/admin/projects/new" className={buttonVariants()}>
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New project
          </Link>
        </div>
      </div>

      {/* Featured Section */}
      {data && featuredProjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-muted/40 px-4 py-3">
          <HugeiconsIcon
            icon={StarIcon}
            size={14}
            className="shrink-0 text-muted-foreground"
          />
          <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Featured
          </span>
          <div className="hidden h-4 w-px bg-border sm:block" />
          {featuredProjects.map((project) => (
            <div key={project.id} className="group flex items-center gap-2.5">
              {project.heroImage?.url ? (
                <img
                  src={project.heroImage.url}
                  alt=""
                  className="size-8 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="size-8 shrink-0 rounded bg-border" />
              )}
              <span className="max-w-50 truncate text-sm text-foreground">
                {project.title}
              </span>
              <button
                type="button"
                onClick={() => handleToggleFeatured(project)}
                className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                title="Unfeature"
              >
                <HugeiconsIcon icon={Delete02Icon} size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="h-10 w-full rounded-full bg-card md:w-72">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search projects…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10"
            />
          </InputGroup>
          <SegmentedControl
            label="Filter by status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </div>
        <SegmentedControl
          label="Switch view"
          options={VIEW_OPTIONS}
          value={view}
          onChange={setView}
        />
      </div>

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
        <SkeletonGrid />
      ) : data && data.projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-sm text-muted-foreground">
            No projects found. Try a different search, or create your first
            project.
          </p>
          <Link
            href="/admin/projects/new"
            className={cn(buttonVariants(), "mt-4")}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New project
          </Link>
        </div>
      ) : (
        data && (
          <>
            <div className={cn(isLoading && "pointer-events-none opacity-60")}>
              {view === "table" ? (
                <ProjectTable
                  projects={data.projects}
                  onDelete={isDeleting ? undefined : handleDelete}
                  onToggleFeatured={handleToggleFeatured}
                  canFeatureMore={canFeatureMore}
                />
              ) : (
                <ProjectCards
                  projects={data.projects}
                  onDelete={isDeleting ? undefined : handleDelete}
                  onToggleFeatured={handleToggleFeatured}
                  canFeatureMore={canFeatureMore}
                />
              )}
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
