"use client";

import Link from "next/link";
import type { DashboardStats } from "../actions";

/* ─── Tiny helpers ─── */

function Dot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block size-[7px] rounded-full ${
        active ? "bg-[var(--chart-2)]" : "bg-[var(--destructive)]/30"
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
  const published =
    stats.products.active + stats.projects.published + stats.blog.published;
  const drafts =
    stats.products.drafts + stats.projects.drafts + stats.blog.drafts;

  return (
    <div className="grid gap-3 lg:grid-cols-12">
      {/* ── Hero: Products ── */}
      <Link
        href="/admin/products"
        className="group relative col-span-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--ring)] lg:col-span-5"
      >
        {/* Background decoration */}
        <div className="absolute -bottom-16 -right-16 size-48 rounded-full bg-[var(--chart-2)]/[0.04] blur-2xl transition-transform duration-500 group-hover:scale-150" />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Products
          </p>

          <p className="mt-3 font-heading text-5xl font-bold tracking-tight text-foreground">
            {stats.products.total}
          </p>

          <div className="mt-4 flex items-center gap-4 text-[13px] text-muted-foreground">
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

          {/* Stock dots */}
          <div className="mt-4 flex flex-wrap gap-[5px]">
            {Array.from(
              { length: Math.min(stats.products.total, 30) },
              (_, i) => (
                <Dot key={i} active={i < inStock} />
              ),
            )}
          </div>
        </div>
      </Link>

      {/* ── Right column: 2 stacked cards ── */}
      <div className="col-span-full flex flex-col gap-3 lg:col-span-7">
        {/* Top row: Projects + Blog */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/projects"
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-[var(--ring)]"
          >
            <div className="absolute -bottom-10 -right-10 size-32 rounded-full bg-[var(--chart-3)]/[0.04] blur-2xl transition-transform duration-500 group-hover:scale-150" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Projects
                </p>
                <p className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
                  {stats.projects.total}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {stats.projects.published} published
                  {stats.projects.ongoing > 0 &&
                    ` · ${stats.projects.ongoing} ongoing`}
                </p>
              </div>
              <Ring
                value={stats.projects.published}
                max={stats.projects.total || 1}
                color="var(--chart-3)"
              />
            </div>
          </Link>

          <Link
            href="/admin/blog"
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-[var(--ring)]"
          >
            <div className="absolute -bottom-10 -right-10 size-32 rounded-full bg-[var(--chart-4)]/[0.04] blur-2xl transition-transform duration-500 group-hover:scale-150" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Blog
                </p>
                <p className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
                  {stats.blog.total}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {stats.blog.published} published
                  {stats.blog.drafts > 0 &&
                    ` · ${stats.blog.drafts} draft${stats.blog.drafts > 1 ? "s" : ""}`}
                </p>
              </div>
              <Ring
                value={stats.blog.published}
                max={stats.blog.total || 1}
                color="var(--chart-4)"
              />
            </div>
          </Link>
        </div>

        {/* Bottom row: Attention signals */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/admin/products"
            className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 transition-all hover:border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/[0.02]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--destructive)]/10">
              <span className="size-2 rounded-full bg-[var(--destructive)]" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Out of stock
              </p>
              <p className="text-xl font-bold tabular-nums text-[var(--destructive)]">
                {stats.products.outOfStock}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5">
            <Ring
              value={published}
              max={published + drafts || 1}
              size={36}
              stroke={4}
              color="var(--chart-1)"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Published
              </p>
              <p className="text-xl font-bold tabular-nums text-foreground">
                {published}
              </p>
            </div>
          </div>

          <Link
            href="/admin/categories"
            className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 transition-all hover:border-[var(--ring)]"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
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
  );
}
