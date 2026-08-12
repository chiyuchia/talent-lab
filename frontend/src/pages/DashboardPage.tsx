import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, FileText, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { AnimatedPage } from "../components/AnimatedPage";
import { ScoreBarChart } from "../components/dashboard/ScoreBarChart";
import { StatusDistributionChart } from "../components/dashboard/StatusDistributionChart";
import { candidateApi, jobsApi } from "../lib/api";
import { statusLabels } from "../lib/format";
import type { CandidateStatus } from "../types/api";

export function DashboardPage() {
  const candidatesQuery = useQuery({
    queryKey: ["candidates", "dashboard"],
    queryFn: () =>
      candidateApi.list({ page: 1, page_size: 100, sort: "-uploaded_at" }),
  });
  const jobsQuery = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });
  const candidates = useMemo(
    () => candidatesQuery.data?.items ?? [],
    [candidatesQuery.data?.items],
  );
  const scored = candidates.filter(
    (candidate) => typeof candidate.total_score === "number",
  );
  const averageScore = scored.length
    ? Math.round(
        scored.reduce(
          (sum, candidate) => sum + (candidate.total_score ?? 0),
          0,
        ) / scored.length,
      )
    : null;

  const metrics = [
    {
      label: "候选人",
      value: String(candidatesQuery.data?.total ?? 0),
      icon: Users,
    },
    {
      label: "已解析",
      value: String(
        candidates.filter((candidate) => candidate.parse_status === "completed")
          .length,
      ),
      icon: FileText,
    },
    {
      label: "平均分",
      value: averageScore === null ? "--" : String(averageScore),
      icon: TrendingUp,
    },
    {
      label: "岗位",
      value: String(jobsQuery.data?.items.length ?? 0),
      icon: BarChart3,
    },
  ];
  const statusData = useMemo(
    () =>
      (Object.entries(statusLabels) as Array<[CandidateStatus, string]>)
        .map(([status, label]) => ({
          status,
          label,
          value: candidates.filter((candidate) => candidate.status === status)
            .length,
        }))
        .filter((item) => item.value > 0),
    [candidates],
  );
  const scoreData = candidates
    .filter((candidate) => typeof candidate.total_score === "number")
    .slice(0, 8)
    .map((candidate) => ({
      name: candidate.name || `#${candidate.id}`,
      score: candidate.total_score ?? 0,
    }));

  return (
    <AnimatedPage>
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">总览</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            候选人解析和评分概况
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border stagger-children md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums">{metric.value}</p>
            </div>
          ))}
        </div>
        <div>
          <h3 className="border-b border-border pb-3 text-lg font-medium">数据分布</h3>
          <div className="mt-6 grid gap-8 xl:grid-cols-2">
            <StatusDistributionChart statusData={statusData} />
            <ScoreBarChart scoreData={scoreData} />
          </div>
        </div>
        <div>
          <h3 className="border-b border-border pb-3 text-lg font-medium">最近上传</h3>
          <div className="divide-y divide-border stagger-children">
            {candidates.slice(0, 6).map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between px-4 py-3 text-sm table-row-hover hover:bg-muted/30"
              >
                <Link
                  className="hover:text-primary transition-colors"
                  to={`/candidates/${candidate.id}`}
                >
                  {candidate.name || candidate.original_filename}
                </Link>
                <span className="tabular-nums text-muted-foreground">
                  {candidate.total_score ?? "--"}
                </span>
              </div>
            ))}
            {!candidates.length ? (
              <div className="p-6 text-sm text-muted-foreground">
                暂无候选人
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}
