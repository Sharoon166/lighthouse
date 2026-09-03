"use client";

import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { Bar, LinePath, AreaClosed } from "@visx/shape";
import { Tooltip, useTooltip } from "@visx/tooltip";
import { LinearGradient } from "@visx/gradient";
import { useMemo } from "react";
import type { DashboardStats } from "../actions";

const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/* ─── Products by Category (Horizontal Bar) ─── */

function ProductsByCategory({
  data,
}: {
  data: DashboardStats["products"]["byCategory"];
}) {
  const tooltip = useTooltip<{ name: string; count: number }>();
  const items = useMemo(() => data.slice(0, 7), [data]);

  const width = 600;
  const height = 280;
  const margin = { top: 8, right: 56, bottom: 8, left: 120 };

  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...items.map((d) => d.count), 1)],
        range: [margin.left, width - margin.right],
        nice: true,
      }),
    [items, margin.left, margin.right, width],
  );

  const yScale = useMemo(
    () =>
      scaleBand({
        domain: items.map((d) => d.name),
        range: [margin.top, height - margin.bottom],
        padding: 0.3,
      }),
    [items, margin.top, margin.bottom, height],
  );

  const barH = yScale.bandwidth();
  const colorScale = scaleOrdinal({
    domain: items.map((d) => d.name),
    range: palette,
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="mb-1 font-heading text-lg font-semibold text-foreground">
        Products by category
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        {items.length} of {data.length} categories shown
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          {items.map((item) => (
            <LinearGradient
              key={item.name}
              id={`cat-${item.name.replace(/\s+/g, "-")}`}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor={colorScale(item.name)}
                stopOpacity={0.9}
              />
              <stop
                offset="100%"
                stopColor={colorScale(item.name)}
                stopOpacity={0.55}
              />
            </LinearGradient>
          ))}
        </defs>
        <Group>
          {items.map((item) => {
            const bw = Math.max(xScale(item.count) - margin.left, 12);
            const active = tooltip.tooltipData?.name === item.name;
            return (
              <g key={item.name}>
                <rect
                  x={margin.left}
                  y={yScale(item.name) ?? 0}
                  width={width - margin.left - margin.right}
                  height={barH}
                  rx={6}
                  fill="var(--muted)"
                  opacity={0.35}
                />
                <Bar
                  x={margin.left}
                  y={yScale(item.name) ?? 0}
                  width={bw}
                  height={barH}
                  rx={6}
                  fill={`url(#cat-${item.name.replace(/\s+/g, "-")})`}
                  opacity={active ? 1 : 0.88}
                  onMouseEnter={() =>
                    tooltip.showTooltip({
                      tooltipData: item,
                      tooltipLeft: margin.left + bw + 16,
                      tooltipTop: (yScale(item.name) ?? 0) + barH / 2,
                    })
                  }
                  onMouseLeave={tooltip.hideTooltip}
                  style={{ cursor: "pointer", transition: "opacity 150ms" }}
                />
                <text
                  x={margin.left - 14}
                  y={(yScale(item.name) ?? 0) + barH / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="var(--muted-foreground)"
                  fontSize={12}
                  fontFamily="var(--font-sans)"
                >
                  {item.name.length > 16
                    ? `${item.name.slice(0, 16)}…`
                    : item.name}
                </text>
                <text
                  x={margin.left + bw + 10}
                  y={(yScale(item.name) ?? 0) + barH / 2}
                  dominantBaseline="middle"
                  fill="var(--foreground)"
                  fontSize={13}
                  fontWeight={600}
                  fontFamily="var(--font-sans)"
                >
                  {item.count}
                </text>
              </g>
            );
          })}
        </Group>
      </svg>
      {tooltip.tooltipData && (
        <Tooltip top={tooltip.tooltipTop} left={tooltip.tooltipLeft}>
          <div className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background shadow-lg">
            <span className="font-medium">{tooltip.tooltipData.name}</span>
            <span className="ml-2 opacity-70">
              {tooltip.tooltipData.count} products
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

/* ─── Stock Status (Stacked horizontal bars) ─── */

function StockStatus({
  data,
}: {
  data: DashboardStats["products"]["stockByCategory"];
}) {
  const tooltip = useTooltip<{
    name: string;
    inStock: number;
    outOfStock: number;
  }>();
  const items = useMemo(() => data.slice(0, 7), [data]);

  const width = 600;
  const rowH = 38;
  const height = items.length * rowH + 16;
  const margin = { left: 120, right: 56 };

  const maxTotal = Math.max(...items.map((d) => d.inStock + d.outOfStock), 1);
  const barWidth = width - margin.left - margin.right;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="mb-1 font-heading text-lg font-semibold text-foreground">
        Stock status
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        In stock vs out of stock by category
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <LinearGradient id="stk-in" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.6} />
          </LinearGradient>
          <LinearGradient id="stk-out" x1="0" y1="0" x2="1" y2="0">
            <stop
              offset="0%"
              stopColor="var(--destructive)"
              stopOpacity={0.8}
            />
            <stop
              offset="100%"
              stopColor="var(--destructive)"
              stopOpacity={0.5}
            />
          </LinearGradient>
        </defs>
        {items.map((item, i) => {
          const total = item.inStock + item.outOfStock;
          const y = i * rowH + 8;
          const inW = (item.inStock / maxTotal) * barWidth;
          const outW = (item.outOfStock / maxTotal) * barWidth;
          const active = tooltip.tooltipData?.name === item.name;
          return (
            <g key={item.name}>
              <rect
                x={margin.left}
                y={y}
                width={barWidth}
                height={22}
                rx={6}
                fill="var(--muted)"
                opacity={0.3}
              />
              {item.inStock > 0 && (
                <rect
                  x={margin.left}
                  y={y}
                  width={Math.max(inW, 8)}
                  height={22}
                  rx={6}
                  fill="url(#stk-in)"
                  opacity={active ? 1 : 0.85}
                />
              )}
              {item.outOfStock > 0 && (
                <rect
                  x={margin.left + inW}
                  y={y}
                  width={Math.max(outW, 8)}
                  height={22}
                  rx={6}
                  fill="url(#stk-out)"
                  opacity={active ? 0.95 : 0.7}
                />
              )}
              <text
                x={margin.left - 14}
                y={y + 11}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--muted-foreground)"
                fontSize={12}
                fontFamily="var(--font-sans)"
              >
                {item.name.length > 16
                  ? `${item.name.slice(0, 16)}…`
                  : item.name}
              </text>
              {/* Hover target */}
              <rect
                x={margin.left}
                y={y}
                width={barWidth}
                height={22}
                fill="transparent"
                onMouseEnter={() =>
                  tooltip.showTooltip({
                    tooltipData: item,
                    tooltipLeft: margin.left + barWidth / 2,
                    tooltipTop: y + 11,
                  })
                }
                onMouseLeave={tooltip.hideTooltip}
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-chart-2" />
          In stock
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-destructive" />
          Out of stock
        </span>
      </div>
      {tooltip.tooltipData && (
        <Tooltip top={tooltip.tooltipTop} left={tooltip.tooltipLeft}>
          <div className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background shadow-lg">
            <span className="font-medium">
              {tooltip.tooltipData.name}
            </span>
            <span className="ml-2 opacity-70">
              {tooltip.tooltipData.inStock} in / {tooltip.tooltipData.outOfStock}{" "}
              out
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

/* ─── Publishing Activity (Area + Line) ─── */

function PublishingActivity({
  data,
}: {
  data: DashboardStats["publishingActivity"];
}) {
  const tooltip = useTooltip<{ month: string; count: number }>();

  const width = 600;
  const height = 200;
  const margin = { top: 20, right: 24, bottom: 36, left: 40 };

  const xScale = useMemo(
    () =>
      scaleBand({
        domain: data.map((d) => d.month),
        range: [margin.left, width - margin.right],
        padding: 0.3,
      }),
    [data, margin.left, margin.right, width],
  );

  const yMax = Math.max(...data.map((d) => d.count), 2);
  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, yMax],
        range: [height - margin.bottom, margin.top],
        nice: true,
      }),
    [yMax, margin.top, margin.bottom, height],
  );

  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en", {
      month: "short",
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
      <p className="mb-1 font-heading text-lg font-semibold text-foreground">
        Publishing activity
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        Content published across all channels
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
            <stop
              offset="100%"
              stopColor="var(--chart-1)"
              stopOpacity={0.02}
            />
          </LinearGradient>
        </defs>
        {yScale.ticks(4).map((tick) => (
          <line
            key={tick}
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="var(--border)"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
        ))}
        <Group>
          <AreaClosed
            data={data}
            x={(d) => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
            y={(d) => yScale(d.count)}
            yScale={yScale}
            fill="url(#areaFill)"
            strokeWidth={0}
          />
          <LinePath
            data={data}
            x={(d) => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
            y={(d) => yScale(d.count)}
            stroke="var(--chart-1)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d) => {
            const cx = (xScale(d.month) ?? 0) + xScale.bandwidth() / 2;
            const cy = yScale(d.count);
            return (
              <g key={d.month}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill="transparent"
                  onMouseEnter={() =>
                    tooltip.showTooltip({
                      tooltipData: d,
                      tooltipLeft: cx + 14,
                      tooltipTop: cy - 12,
                    })
                  }
                  onMouseLeave={tooltip.hideTooltip}
                  style={{ cursor: "pointer" }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={d.count > 0 ? 4 : 2.5}
                  fill="var(--card)"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </g>
            );
          })}
          <AxisBottom
            top={height - margin.bottom + 10}
            scale={xScale}
            tickFormat={formatMonth}
            hideTicks
            hideAxisLine
            tickLabelProps={{
              fontSize: 11,
              fill: "var(--muted-foreground)",
              fontFamily: "var(--font-sans)",
            }}
          />
          <AxisLeft
            left={margin.left - 10}
            scale={yScale}
            hideTicks
            hideAxisLine
            tickFormat={(v) => String(v)}
            tickLabelProps={{
              fontSize: 11,
              fill: "var(--muted-foreground)",
              fontFamily: "var(--font-sans)",
            }}
          />
        </Group>
      </svg>
      {tooltip.tooltipData && (
        <Tooltip top={tooltip.tooltipTop} left={tooltip.tooltipLeft}>
          <div className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background shadow-lg">
            <span className="font-medium">
              {formatMonth(tooltip.tooltipData.month)}
            </span>
            <span className="ml-2 opacity-70">
              {tooltip.tooltipData.count} published
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

/* ─── Export ─── */

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return (
    <div>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Analytics
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <ProductsByCategory data={stats.products.byCategory} />
        <StockStatus data={stats.products.stockByCategory} />
        <PublishingActivity data={stats.publishingActivity} />
      </div>
    </div>
  );
}
