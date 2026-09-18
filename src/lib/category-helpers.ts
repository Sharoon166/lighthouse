/**
 * Shared helpers for computing cumulative category product counts.
 *
 * Every category stores its *own* product count in `productCount`.
 * For the sidebar / filter / header displays we need the count of a category
 * PLUS all of its descendants. This module provides a single source of truth
 * for that computation.
 */

/** Minimal shape the helper needs from a category document. */
export interface CategoryDoc {
  _id: { toString(): string } | string;
  slug: string;
  parent?: { toString(): string } | string | null;
  productCount?: number;
}

interface TreeNode {
  id: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  children: TreeNode[];
}

/**
 * Given a flat array of category documents, return a `Map<slug, cumulativeCount>`
 * where `cumulativeCount` = own `productCount` + all descendants' `productCount`.
 */
export function computeCumulativeCounts<T extends CategoryDoc>(
  categories: T[],
): Map<string, number> {
  const nodeMap = new Map<string, TreeNode>();

  for (const c of categories) {
    const id = typeof c._id === "string" ? c._id : c._id.toString();
    const parentId = c.parent
      ? typeof c.parent === "string"
        ? c.parent
        : c.parent.toString()
      : null;

    nodeMap.set(id, {
      id,
      slug: c.slug,
      parentId,
      productCount: c.productCount ?? 0,
      children: [],
    });
  }

  // Build parent → children links
  const roots: TreeNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Recursive cumulative sum
  function computeCounts(node: TreeNode): number {
    let total = node.productCount;
    for (const child of node.children) {
      total += computeCounts(child);
    }
    node.productCount = total;
    return total;
  }
  for (const root of roots) {
    computeCounts(root);
  }

  // Flatten to slug → count
  const result = new Map<string, number>();
  function flatten(nodes: TreeNode[]) {
    for (const node of nodes) {
      result.set(node.slug, node.productCount);
      flatten(node.children);
    }
  }
  flatten(roots);

  return result;
}

/**
 * Generic recursive cumulative count for any tree of nodes with
 * `productCount` and `children`. Mutates in place and returns the roots.
 */
export interface TreeNodeLike {
  productCount: number;
  children: TreeNodeLike[];
}

export function applyCumulativeCounts<T extends TreeNodeLike>(roots: T[]): T[] {
  function compute(node: TreeNodeLike): number {
    let total = node.productCount;
    for (const child of node.children) {
      total += compute(child);
    }
    node.productCount = total;
    return total;
  }
  for (const root of roots) {
    compute(root);
  }
  return roots;
}
