"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  Delete02Icon,
  Edit02Icon,
  ImageIcon,
  PlusSignIcon,
  Search01Icon,
  TagsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  type CategoryTreeNode,
  deleteCategory,
  getCategoryTree,
} from "../actions/category-actions";

function TreeNode({
  node,
  depth,
  onDelete,
}: {
  node: CategoryTreeNode;
  depth: number;
  onDelete?: (node: CategoryTreeNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
        )}
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
      >
        <button
          type="button"
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted",
            !hasChildren && "invisible",
          )}
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <HugeiconsIcon
            icon={expanded ? ChevronDownIcon : ChevronRightIcon}
            size={14}
          />
        </button>

        {node.image ? (
          <img
            src={node.image}
            alt=""
            className="size-6 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <HugeiconsIcon
            icon={TagsIcon}
            size={14}
            className="shrink-0 text-muted-foreground"
          />
        )}

        <div className="min-w-0 flex-1">
          <span className="font-medium text-foreground">{node.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            /{node.slug}
          </span>
        </div>

        {node.productCount > 0 && (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {node.productCount} products
          </span>
        )}

        {!node.isActive && (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            Inactive
          </span>
        )}

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            href={`/admin/categories/edit/${node.id}`}
            aria-label={`Edit ${node.name}`}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={Edit02Icon} size={14} />
          </Link>
          {onDelete && (
            <button
              type="button"
              aria-label={`Delete ${node.name}`}
              onClick={() => onDelete(node)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}

export function CategoriesManager() {
  const { confirm } = useConfirm();
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getCategoryTree()
      .then((result) => {
        if (!cancelled) setTree(result);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load categories. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (node: CategoryTreeNode) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Delete this category?",
      description: (
        <>
          "{node.name}" will be permanently deleted. This action cannot be
          undone.
        </>
      ),
      confirmLabel: "Delete",
      cancelLabel: "Keep category",
      danger: true,
    });

    if (!confirmed) return;

    const result = await deleteCategory(node.id);

    if (!result.ok) {
      setActionError(result.message ?? "Could not delete this category.");
      return;
    }

    const refreshed = await getCategoryTree();
    setTree(refreshed);
  };

  const filterTree = (
    nodes: CategoryTreeNode[],
    query: string,
  ): CategoryTreeNode[] => {
    if (!query) return nodes;
    const lower = query.toLowerCase();
    return nodes
      .map((node) => {
        const nameMatch = node.name.toLowerCase().includes(lower);
        const slugMatch = node.slug.toLowerCase().includes(lower);
        const filteredChildren = filterTree(node.children, query);
        if (nameMatch || slugMatch || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as CategoryTreeNode[];
  };

  const filteredTree = filterTree(tree, search);

  const countAll = (nodes: CategoryTreeNode[]): number =>
    nodes.reduce((sum, n) => sum + 1 + countAll(n.children), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize your products into categories and subcategories.
          </p>
        </div>
        <Link href="/admin/categories/new" className={buttonVariants()}>
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          New category
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-10 w-full rounded-full bg-card md:w-72">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search categories…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10"
          />
        </InputGroup>
        {!isLoading && (
          <span className="text-sm text-muted-foreground">
            {countAll(tree)} total categories
          </span>
        )}
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

      {isLoading ? (
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredTree.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-sm text-muted-foreground">
            {search
              ? "No categories match your search."
              : "No categories yet. Create your first category to organize products."}
          </p>
          {!search && (
            <Link
              href="/admin/categories/new"
              className={cn(buttonVariants(), "mt-4")}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
              New category
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <div className="p-2">
            {filteredTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
