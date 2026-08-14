import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { statusChartColors, tooltipProps } from "../../lib/chart-theme";
import type { CandidateStatus } from "../../types/api";

interface StatusDistributionChartProps {
  statusData: Array<{ status: CandidateStatus; label: string; value: number }>;
}

export function StatusDistributionChart({ statusData }: StatusDistributionChartProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  return (
    <div className="h-80">
      <h4 className="mb-2 text-sm font-medium text-muted-foreground">
        {t("候选人状态分布")}
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={statusData}
            dataKey="value"
            nameKey="label"
            outerRadius={80}
            stroke="hsl(var(--card))"
            strokeWidth={2}
            isAnimationActive={!reducedMotion}
            animationDuration={320}
            animationEasing="ease-out"
            label={({ label, value, percent }) =>
              `${label}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {statusData.map((item) => (
              <Cell key={item.status} fill={statusChartColors[item.status]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Tooltip
            {...tooltipProps}
            formatter={(value, _name, props) => [
              t("{{value}} 人 ({{percent}}%)", {
                value,
                percent: ((props?.payload?.percent ?? 0) * 100).toFixed(0),
              }),
              props?.payload?.label ?? t("数量"),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
