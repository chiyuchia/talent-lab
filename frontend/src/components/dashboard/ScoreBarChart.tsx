import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { axisTickProps, barGradientDefs, tooltipProps } from "../../lib/chart-theme";

interface ScoreBarChartProps {
  scoreData: Array<{ name: string; score: number }>;
}

export function ScoreBarChart({ scoreData }: ScoreBarChartProps) {
  return (
    <div className="h-80">
      <h4 className="mb-2 text-sm font-medium text-muted-foreground">
        候选人评分
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={scoreData}>
          {barGradientDefs}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="name" {...axisTickProps} />
          <YAxis domain={[0, 100]} {...axisTickProps} />
          <Tooltip
            {...tooltipProps}
            formatter={(value) => [value, "评分"]}
            labelFormatter={(label) => `候选人：${label}`}
          />
          <Bar dataKey="score" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
