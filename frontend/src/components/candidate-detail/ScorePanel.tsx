import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { axisTickProps, barGradientDefs, tooltipProps } from "../../lib/chart-theme";
import type { ScoreResult } from "../../types/api";
import { MatchInsights } from "./MatchInsights";

interface ScorePanelProps {
  candidateScores: ScoreResult[];
}

export function ScorePanel({ candidateScores }: ScorePanelProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const chartData = useMemo(() => {
    const score = candidateScores[0];
    if (!score) return [];
    return [
      { metric: t("技能"), score: score.skill_score },
      { metric: t("经验"), score: score.experience_score },
      { metric: t("教育"), score: score.education_score },
    ];
  }, [candidateScores, t]);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-medium">{t("评分")}</h3>
      {candidateScores.length ? (
        <>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <defs>
                  <radialGradient id="radarGradient">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Radar
                  dataKey="score"
                  fill="url(#radarGradient)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  isAnimationActive={!reducedMotion}
                  animationDuration={320}
                  animationEasing="ease-out"
                />
                <Tooltip {...tooltipProps} formatter={(value) => [value, t("评分")]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidateScores}>
                {barGradientDefs}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="job_title" {...axisTickProps} />
                <YAxis domain={[0, 100]} {...axisTickProps} />
                <Tooltip {...tooltipProps} formatter={(value) => [value, t("总分")]} labelFormatter={(label) => t("岗位：{{name}}", { name: label })} />
                <Bar
                  dataKey="total_score"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={!reducedMotion}
                  animationDuration={320}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {candidateScores.map((score) => (
              <div key={score.id} className="card-hover rounded-md border border-border bg-background p-3 text-sm">
                <p className="font-medium">{score.job_title}：{score.total_score}</p>
                <p className="mt-1 text-muted-foreground">{score.ai_comment}</p>
                <MatchInsights details={score.details} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5 grid h-72 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">{t("暂无评分")}</div>
      )}
    </div>
  );
}
