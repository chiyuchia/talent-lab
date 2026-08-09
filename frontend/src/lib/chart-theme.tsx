import type { CandidateStatus } from "../types/api";

export const statusChartColors: Record<CandidateStatus, string> = {
  pending: "hsl(var(--chart-pending))",
  screen_passed: "hsl(var(--chart-passed))",
  interviewing: "hsl(var(--chart-interviewing))",
  hired: "hsl(var(--chart-hired))",
  rejected: "hsl(var(--chart-rejected))",
};

export const axisTickProps = {
  tick: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: "hsl(var(--border))" },
} as const;

export const tooltipProps = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 6,
    boxShadow: "0 4px 12px rgb(0 0 0 / 0.12)",
    fontSize: 12,
  },
  labelStyle: { color: "hsl(var(--card-foreground))", fontWeight: 500 },
  itemStyle: { color: "hsl(var(--muted-foreground))" },
} as const;

// Recharts filters out custom component children, so the gradient must be a
// plain <defs> element to end up inside the chart's <svg>.
export const barGradientDefs = (
  <defs>
    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
      <stop offset="100%" stopColor="hsl(var(--primary-deep))" stopOpacity={0.85} />
    </linearGradient>
  </defs>
);
