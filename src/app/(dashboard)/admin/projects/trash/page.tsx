import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { listTrashedProjects } from "@/features/projects/actions";
import { ProjectTrashManager } from "@/features/projects/components/project-trash-manager";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = {
  title: "Trash · Lighthouse",
};

export default async function ProjectTrashPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await requireRole(["admin"]);
  if (!session) redirect("/admin/projects");
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const data = await listTrashedProjects({ page, pageSize: 12, search });

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
                Project Trash
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Restore a project or delete it forever.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/projects"
          className={buttonVariants({ variant: "outline" })}
        >
          All projects
        </Link>
      </div>

      <ProjectTrashManager initialData={data} />
    </div>
  );
}
