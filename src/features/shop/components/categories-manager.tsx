"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Collapse,
  Delete02Icon,
  DragDropIcon,
  Edit02Icon,
  Expand,
  ImageIcon,
  PlusSignIcon,
  Search01Icon,
  Star,
  StarIcon,
  TagsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  type CategoryTreeNode,
  deleteCategory,
  getCategoryTree,
  reorderCategories,
  toggleFeaturedCategory,
} from "../actions/category-actions";

interface SortableTreeNodeProps {
  node: CategoryTreeNode;
  depth: number;
  index: number;
  onDelete?: (node: CategoryTreeNode) => void;
  onToggleFeatured?: (node: CategoryTreeNode) => void;
  onReorder?: (parentId: string | null, reordered: CategoryTreeNode[]) => void;
  canFeatureMore?: boolean;
  defaultExpanded?: boolean;
}

function SortableTreeNode({
  node,
  depth,
  index,
  onDelete,
  onToggleFeatured,
  onReorder,
  canFeatureMore,
  defaultExpanded,
}: SortableTreeNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TreeNodeContent
        node={node}
        depth={depth}
        index={index}
        onDelete={onDelete}
        onToggleFeatured={onToggleFeatured}
        onReorder={onReorder}
        canFeatureMore={canFeatureMore}
        defaultExpanded={defaultExpanded}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function TreeNodeContent({
  node,
  depth,
  index,
  onDelete,
  onToggleFeatured,
  onReorder,
  canFeatureMore,
  defaultExpanded,
  dragHandleProps,
}: SortableTreeNodeProps & {
  dragHandleProps?: Record<string, unknown>;
}) {
  const [expanded, setExpanded] = useState(
    defaultExpanded !== undefined ? defaultExpanded : depth < 1,
  );
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-sm transition-colors hover:bg-muted/50",
        )}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        {/* Drag handle */}
        {dragHandleProps && (
          <button
            type="button"
            className="flex shrink-0 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-muted-foreground cursor-grab active:cursor-grabbing"
            aria-label={`Drag to reorder ${node.name}`}
            {...dragHandleProps}
          >
            <HugeiconsIcon icon={DragDropIcon} size={14} />
          </button>
        )}

        <div className="font-heading font-semibold">#{index + 1}.</div>

        <button
          type="button"
          className={cn(
            "flex shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted",
            !hasChildren && "invisible",
          )}
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <HugeiconsIcon
            icon={expanded ? ChevronDownIcon : ChevronRightIcon}
            size={18}
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
          <span className="font-heading text-base sm:text-lg font-semibold text-foreground">
            {node.name}
          </span>
          <span className="ml-1.5 text-xs text-muted-foreground max-sm:hidden">
            /{node.slug}
          </span>
        </div>

        {/* Badges — hidden on mobile to reduce clutter */}
        {node.productCount > 0 && (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground max-sm:hidden">
            {node.productCount} products
          </span>
        )}

        {!node.isActive && (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground max-sm:hidden">
            Inactive
          </span>
        )}

        {node.featured && (
          <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2 py-1 text-xs font-medium text-gold border border-gold">
            <HugeiconsIcon icon={Star} size={16} /> Featured
          </span>
        )}

        {/* Actions — always visible on mobile (no hover), hidden until hover on desktop */}
        <div className="flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          {onToggleFeatured && (
            <button
              type="button"
              aria-label={
                node.featured
                  ? `Unfeature ${node.name}`
                  : `Feature ${node.name}`
              }
              title={
                node.featured
                  ? "Remove from featured"
                  : canFeatureMore
                    ? "Add to featured"
                    : "Featured limit reached"
              }
              disabled={!node.featured && !canFeatureMore}
              onClick={() => onToggleFeatured(node)}
              className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors",
                node.featured
                  ? "text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                !node.featured &&
                  !canFeatureMore &&
                  "cursor-not-allowed opacity-40",
              )}
            >
              <HugeiconsIcon icon={StarIcon} size={14} />
            </button>
          )}
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

      {expanded && node.children.length > 0 && (
        <SortableTreeLevel
          nodes={node.children}
          depth={depth + 1}
          onDelete={onDelete}
          onToggleFeatured={onToggleFeatured}
          onReorder={onReorder}
          canFeatureMore={canFeatureMore}
          defaultExpanded={defaultExpanded}
        />
      )}
    </div>
  );
}

function SortableTreeLevel({
  nodes,
  depth,
  onDelete,
  onToggleFeatured,
  onReorder,
  canFeatureMore,
  defaultExpanded,
}: {
  nodes: CategoryTreeNode[];
  depth: number;
  onDelete?: (node: CategoryTreeNode) => void;
  onToggleFeatured?: (node: CategoryTreeNode) => void;
  onReorder?: (parentId: string | null, reordered: CategoryTreeNode[]) => void;
  canFeatureMore?: boolean;
  defaultExpanded?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = nodes.findIndex((n) => n.id === active.id);
      const newIndex = nodes.findIndex((n) => n.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(nodes, oldIndex, newIndex);
      const orderedIds = reordered.map((n) => n.id);

      const parentId = nodes[0]?.parentId ?? null;

      onReorder?.(parentId, reordered);
      await reorderCategories(orderedIds);
    },
    [nodes, onReorder],
  );

  const nodeIds = nodes.map((n) => n.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={nodeIds} strategy={verticalListSortingStrategy}>
        {nodes.map((node, index) => (
          <SortableTreeNode
            key={node.id}
            node={node}
            depth={depth}
            index={index}
            onDelete={onDelete}
            onToggleFeatured={onToggleFeatured}
            onReorder={onReorder}
            canFeatureMore={canFeatureMore}
            defaultExpanded={defaultExpanded}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

export function CategoriesManager({
  initialTree,
}: {
  initialTree?: CategoryTreeNode[];
}) {
  const { confirm } = useConfirm();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";
  const [tree, setTree] = useState<CategoryTreeNode[]>(initialTree ?? []);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(!initialTree);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [treeVersion, setTreeVersion] = useState(0);
  const [forceExpand, setForceExpand] = useState<boolean | null>(null);

  useEffect(() => {
    if (initialTree) return;

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
  }, [initialTree]);

  const MAX_FEATURED = 4;

  const countFeatured = (nodes: CategoryTreeNode[]): number =>
    nodes.reduce(
      (sum, n) => sum + (n.featured ? 1 : 0) + countFeatured(n.children),
      0,
    );

  const canFeatureMore = countFeatured(tree) < MAX_FEATURED;

  const handleToggleFeatured = async (node: CategoryTreeNode) => {
    setActionError(null);
    const result = await toggleFeaturedCategory(node.id);

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    const updateFeatured = (nodes: CategoryTreeNode[]): CategoryTreeNode[] =>
      nodes.map((n) =>
        n.id === node.id
          ? { ...n, featured: result.featured }
          : { ...n, children: updateFeatured(n.children) },
      );

    setTree((prev) => updateFeatured(prev));
  };

  const handleDelete = async (node: CategoryTreeNode) => {
    setActionError(null);

    const confirmed = await confirm({
      title: "Delete this category?",
      description: (
        <>
          &ldquo;{node.name}&rdquo; will be permanently deleted. This action
          cannot be undone.
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

  const handleExpandAll = () => {
    setForceExpand(true);
    setTreeVersion((v) => v + 1);
  };

  const handleCollapseAll = () => {
    setForceExpand(false);
    setTreeVersion((v) => v + 1);
  };

  const handleReorder = useCallback(
    (parentId: string | null, reordered: CategoryTreeNode[]) => {
      if (parentId === null) {
        setTree(reordered);
        return;
      }

      const replaceChildren = (nodes: CategoryTreeNode[]): CategoryTreeNode[] =>
        nodes.map((n) => {
          if (n.id === parentId) {
            return { ...n, children: reordered };
          }
          return { ...n, children: replaceChildren(n.children) };
        });

      setTree((prev) => replaceChildren(prev));
    },
    [],
  );

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

  const flattenTree = (nodes: CategoryTreeNode[]): CategoryTreeNode[] =>
    nodes.flatMap((n) => [n, ...flattenTree(n.children)]);

  const featuredCategories = flattenTree(tree).filter((n) => n.featured);

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

      {/* Featured Section */}
      {!isLoading && featuredCategories.length > 0 && (
        <div className="rounded-lg bg-muted/40 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:flex-row sm:items-center sm:gap-x-3 sm:gap-y-2">
            <HugeiconsIcon
              icon={StarIcon}
              size={14}
              className="shrink-0 text-muted-foreground"
            />
            <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Featured
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-0 mt-2">
            {featuredCategories.map((cat) => (
              <div key={cat.id} className="group flex items-center gap-2.5 p-2">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt=""
                    className="size-7 sm:size-8 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="size-7 sm:size-8 shrink-0 rounded bg-border" />
                )}
                <span className="max-w-36 sm:max-w-50 truncate text-sm text-foreground">
                  {cat.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(cat)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground sm:opacity-0 sm:transition-all sm:hover:text-destructive sm:group-hover:opacity-100"
                  title="Unfeature"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="h-10 w-full rounded-full bg-card sm:w-72">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search categories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10"
          />
        </InputGroup>
        <div className="flex items-center justify-between gap-2">
          {!isLoading && tree.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleExpandAll}
                aria-label="Expand all categories"
              >
                <HugeiconsIcon icon={Expand} size={16} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleCollapseAll}
                aria-label="Collapse all categories"
              >
                <HugeiconsIcon icon={Collapse} size={16} />
              </Button>
            </div>
          )}
          {!isLoading && (
            <span className="text-sm text-muted-foreground">
              {countAll(tree)} total
            </span>
          )}
        </div>
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
        <Empty className="rounded-2xl border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={TagsIcon} size={24} />
            </EmptyMedia>
            <EmptyTitle>
              {search ? "No categories match" : "No categories yet"}
            </EmptyTitle>
            <EmptyDescription>
              {search
                ? "Try a different search."
                : "Create your first category to organize products."}
            </EmptyDescription>
          </EmptyHeader>
          {!search && (
            <EmptyContent>
              <Link href="/admin/categories/new" className={buttonVariants()}>
                <HugeiconsIcon icon={PlusSignIcon} size={16} />
                New category
              </Link>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <div className="p-1 sm:p-2">
            <SortableTreeLevel
              key={treeVersion}
              nodes={filteredTree}
              depth={0}
              onDelete={isAdmin ? handleDelete : undefined}
              onToggleFeatured={isAdmin ? handleToggleFeatured : undefined}
              onReorder={handleReorder}
              canFeatureMore={canFeatureMore}
              defaultExpanded={forceExpand !== null ? forceExpand : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
