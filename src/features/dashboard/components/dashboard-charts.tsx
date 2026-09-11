"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardStats } from "../actions";

/* ─── Configs ─── */

const categoryChartConfig = {
  count: {
    label: "Products",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const publishingChartConfig = {
  count: {
    label: "Published",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const productStatusConfig = {
  active: {
    label: "Active",
    color: "var(--chart-2)",
  },
  drafts: {
    label: "Drafts",
    color: "var(--chart-4)",
  },
  outOfStock: {
    label: "Out of stock",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

/* ─── Products by Category (Horizontal Bar) ─── */

function ProductsByCategory({
  data,
}: {
  data: DashboardStats["products"]["byCategory"];
}) {
  const items = useMemo(() => data.slice(0, 7), [data]);

  const chartData = useMemo(
    () =>
      items.map((d) => ({
        category: d.name.length > 18 ? `${d.name.slice(0, 18)}…` : d.name,
        count: d.count,
      })),
    [items],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="mb-1 font-heading text-lg font-semibold text-foreground">
        Products by category
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        {items.length} of {data.length} categories shown
      </p>
      <ChartContainer config={categoryChartConfig} className="h-70 w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          <YAxis
            dataKey="category"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={120}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                formatter={(value) => (
                  <span className="font-mono font-medium">
                    {Number(value).toLocaleString()} products
                  </span>
                )}
              />
            }
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[0, 8, 8, 0]}
            barSize={20}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

/* ─── Publishing Activity (Area) ─── */

const formatMonth = (m: string) => {
  const [year, month] = m.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en", {
    month: "short",
  });
};

function PublishingActivity({
  data,
}: {
  data: DashboardStats["publishingActivity"];
}) {
  const chartData = useMemo(
    () => data.map((d) => ({ month: formatMonth(d.month), count: d.count })),
    [data],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="mb-1 font-heading text-lg font-semibold text-foreground">
        Publishing activity
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        Content published across all channels
      </p>
      <ChartContainer
        config={publishingChartConfig}
        className="h-50 w-full"
      >
        <AreaChart
          data={chartData}
          margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="publishFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-count)"
                stopOpacity={0.2}
              />
              <stop
                offset="100%"
                stopColor="var(--color-count)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                formatter={(value) => (
                  <span className="font-mono font-medium">
                    {Number(value).toLocaleString()} published
                  </span>
                )}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            strokeWidth={2.5}
            fill="url(#publishFill)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

/* ─── Product Status (Semi-circle Donut) ─── */

function ProductStatusDonut({
  products,
}: {
  products: DashboardStats["products"];
}) {
  const chartData = useMemo(
    () => [
      { name: "active", value: products.active, fill: "var(--color-active)" },
      { name: "drafts", value: products.drafts, fill: "var(--color-drafts)" },
      {
        name: "outOfStock",
        value: products.outOfStock,
        fill: "var(--color-outOfStock)",
      },
    ],
    [products],
  );

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <p className="mb-1 font-heading text-lg font-semibold text-foreground">
        Product status
      </p>
      <p className="mb-2 text-sm text-muted-foreground">
        Distribution across all products
      </p>
      <div className="flex flex-1 flex-col items-center justify-center">
        <ChartContainer
          config={productStatusConfig}
          className="mx-auto aspect-video h-40"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              startAngle={180}
              endAngle={0}
              innerRadius="55%"
              outerRadius="90%"
              strokeWidth={3}
              stroke="var(--card)"
              cornerRadius={8}              
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => {
                    const label =
                      name === "active"
                        ? "Active"
                        : name === "drafts"
                          ? "Drafts"
                          : "Out of stock";
                    return (
                      <span className="font-mono font-medium">
                        {Number(value).toLocaleString()} {label.toLowerCase()}
                      </span>
                    );
                  }}
                />
              }
            />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-col items-center -mt-4 mb-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-heading text-3xl font-bold text-foreground">
            {products.total.toLocaleString()}
          </p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-chart-2" />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-chart-4" />
          Drafts
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-destructive" />
          Out of stock
        </span>
      </div>
    </div>
  );
}

/* ─── Export ─── */

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Analytics
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ProductStatusDonut products={stats.products} />
        <div className="lg:col-span-2">
          <ProductsByCategory data={stats.products.byCategory} />
        </div>
      </div>
      <div className="mt-4">
        <PublishingActivity data={stats.publishingActivity} />
      </div>
    </div>
  );
}
