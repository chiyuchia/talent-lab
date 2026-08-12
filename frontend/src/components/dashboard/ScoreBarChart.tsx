import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

import { axisTickProps, barGradientDefs, tooltipProps } from "../../lib/chart-theme";

interface ScoreBarChartProps {
  scoreData: Array<{ name: string; score: number }>;
}

export function ScoreBarChart({ scoreData }: ScoreBarChartProps) {
  const { t } = useTranslation();
  return (
    <div className="h-80">
      <h4 className="mb-2 text-sm font-medium text-muted-foreground">
        {t("候选人评分")}
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={scoreData}>
          {barGradientDefs}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="name" {...axisTickProps} />
          <YAxis domain={[0, 100]} {...axisTickProps} />
          <Tooltip
            {...tooltipProps}
            formatter={(value) => [value, t("评分")]}
            labelFormatter={(label) => t("候选人：{{name}}", { name: label })}
          />
          <Bar dataKey="score" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
