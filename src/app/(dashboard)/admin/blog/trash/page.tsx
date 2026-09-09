import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { buttonVariants } from "@/components/ui/button";
import { listTrashedBlogPosts } from "@/features/blog/actions";
import { BlogTrashManager } from "@/features/blog/components/blog-trash-manager";

export const metadata: Metadata = {
  title: "Trash · Lighthouse",
};

export default async function BlogTrashPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const data = await listTrashedBlogPosts({ page, pageSize: 8, search });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/blog"
              aria-label="Back to blog posts"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
            </Link>
            <div>
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                Blogs Trash
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Restore a post or delete it forever.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/blog"
          className={buttonVariants({ variant: "outline" })}
        >
          All posts
        </Link>
      </div>

      <BlogTrashManager initialData={data} />
    </div>
  );
}
