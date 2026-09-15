"use client";

import {
  ArrowUpRight,
  LayoutGrid,
  PackageX,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DashboardStats } from "../actions";
import { OutOfStockSheet } from "./out-of-stock-sheet";

/* ─── Tiny helpers ─── */

function Dot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block size-2 rounded-full ${
        active ? "bg-chart-2" : "bg-destructive/30"
      }`}
    />
  );
}

function Ring({
  value,
  max,
  size = 44,
  stroke = 4,
  color = "var(--primary)",
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/* ─── Main export ─── */

export function DashboardStatCards({ stats }: { stats: DashboardStats }) {
  const inStock = stats.products.total - stats.products.outOfStock;
  const pct =
    stats.products.total > 0
      ? Math.round((inStock / stats.products.total) * 100)
      : 0;
  const published =
    stats.products.active + stats.projects.published + stats.blog.published;
  const drafts =
    stats.products.drafts + stats.projects.drafts + stats.blog.drafts;

  const [oosOpen, setOosOpen] = useState(false);

  const totalsRows = useMemo(
    () => [
      {
        label: "Products",
        count: stats.products.total,
        delta: stats.products.active - stats.products.drafts,
        sub: `${stats.products.active} active · ${stats.products.drafts} drafts`,
        href: "/admin/products",
        newHref: "/admin/products/new",
        accent: "text-[var(--chart-2)]",
        bg: "bg-[var(--chart-2)]/10",
      },
      {
        label: "Projects",
        count: stats.projects.total,
        delta: stats.projects.published - stats.projects.drafts,
        sub: `${stats.projects.published} published · ${stats.projects.drafts} drafts`,
        href: "/admin/projects",
        newHref: "/admin/projects/new",
        accent: "text-chart-3",
        bg: "bg-chart-3/10",
      },
      {
        label: "Blog Posts",
        count: stats.blog.total,
        delta: stats.blog.published - stats.blog.drafts,
        sub: `${stats.blog.published} published · ${stats.blog.drafts} drafts`,
        href: "/admin/blog",
        newHref: "/admin/blog/new",
        accent: "text-chart-4",
        bg: "bg-chart-4/10",
      },
    ],
    [stats],
  );

  return (
    <>
      <OutOfStockSheet open={oosOpen} onOpenChange={setOosOpen} />
      <div className="grid gap-3 lg:grid-cols-12">
        {/* ── Hero: Totals ── */}
        <div className="col-span-full flex flex-col rounded-2xl border border-border bg-card p-6 lg:col-span-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                Totals
              </p>
              <p className="text-xs text-muted-foreground">
                Published vs drafts
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Link
                href="/admin/products/new"
                title="New Product"
                className="flex items-center gap-1 rounded-lg bg-chart-2/10 px-2.5 py-1.5 text-chart-2 transition-colors hover:bg-chart-2/20"
              >
                <Plus size={12} strokeWidth={2.5} />
                <span className="text-[11px] font-medium">Product</span>
              </Link>
              <Link
                href="/admin/projects/new"
                title="New Project"
                className="flex items-center gap-1 rounded-lg bg-chart-3/10 px-2.5 py-1.5 text-chart-3 transition-colors hover:bg-chart-3/20"
              >
                <Plus size={12} strokeWidth={2.5} />
                <span className="text-[11px] font-medium">Project</span>
              </Link>
              <Link
                href="/admin/blog/new"
                title="New Blog Post"
                className="flex items-center gap-1 rounded-lg bg-chart-4/10 px-2.5 py-1.5 text-chart-4 transition-colors hover:bg-chart-4/20"
              >
                <Plus size={12} strokeWidth={2.5} />
                <span className="text-[11px] font-medium">Blog</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1">
            {totalsRows.map((row) => (
              <Link
                key={row.label}
                href={row.href}
                className="group/row flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {row.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.sub}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-heading text-2xl font-extrabold tabular-nums text-foreground">
                    {row.count}
                  </span>
                  {row.delta !== 0 && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${row.bg} ${row.accent}`}
                    >
                      {row.delta > 0 ? (
                        <TrendingUp size={12} strokeWidth={2.5} />
                      ) : (
                        <TrendingDown size={12} strokeWidth={2.5} />
                      )}
                      {Math.abs(row.delta)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="col-span-full flex flex-col gap-3 lg:col-span-7">
          {/* Stock Health (moved here from hero slot) */}
          <Link
            href="/admin/products"
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-ring"
          >
            <div className="absolute -bottom-16 -right-16 size-48 rounded-full bg-chart-2/4 blur-2xl transition-transform duration-500 group-hover:scale-150" />

            <div className="mb-4 flex items-center justify-between">
              <p className="font-heading text-lg font-semibold text-foreground">
                Stock Health
              </p>
              <ArrowUpRight
                size={16}
                className="text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-foreground"
              />
            </div>

            <p className="mt-3 font-heading text-5xl font-bold tracking-tight text-foreground">
              {pct}%
            </p>

            <p className="mt-2 text-[13px] text-muted-foreground">
              {inStock} of {stats.products.total} products in stock
            </p>

            {/* Segmented bar */}
            <div className="mt-4 flex gap-1 h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-chart-2 transition-all duration-500"
                style={{
                  width: `${stats.products.total > 0 ? (inStock / stats.products.total) * 100 : 0}%`,
                }}
              />
              <div
                className="bg-destructive transition-all duration-500"
                style={{
                  width: `${stats.products.total > 0 ? (stats.products.outOfStock / stats.products.total) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center gap-4 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Dot active />
                {inStock} in stock
              </span>
              {stats.products.outOfStock > 0 && (
                <span className="flex items-center gap-1.5">
                  <Dot active={false} />
                  {stats.products.outOfStock} out
                </span>
              )}
            </div>
          </Link>

          {/* Bottom row: Attention signals */}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setOosOpen(true)}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left transition-all hover:border-destructive/30 hover:bg-destructive/2"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <PackageX size={16} className="text-destructive" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-sm tracking-wider font-semibold text-foreground">
                  Out of stock
                </p>
                <p className="text-xl font-bold tabular-nums text-destructive">
                  {stats.products.outOfStock}
                </p>
              </div>
            </button>

            {/*<div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5">
              <Ring
                value={published}
                max={published + drafts || 1}
                size={36}
                stroke={4}
                color="var(--chart-1)"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Published
                </p>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {published}
                </p>
              </div>
            </div>*/}

            <Link
              href="/admin/categories"
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 transition-all hover:border-ring"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                <LayoutGrid size={16} className="text-foreground/70" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-sm tracking-wider font-semibold text-foreground">
                  Catalog
                </p>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {stats.products.byCategory.length}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    cats
                  </span>
                  {" · "}
                  {stats.products.byBrand.length}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    brands
                  </span>
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
