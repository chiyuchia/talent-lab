import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, FilePlus2, Files, FileText, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AnimatedPage } from "../components/AnimatedPage";
import { ScoreBarChart } from "../components/dashboard/ScoreBarChart";
import { StatusDistributionChart } from "../components/dashboard/StatusDistributionChart";
import { Button } from "../components/ui/button";
import { candidateApi, jobsApi } from "../lib/api";
import { statusLabels } from "../lib/format";
import type { CandidateStatus } from "../types/api";

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const candidatesQuery = useQuery({
    queryKey: ["candidates", "dashboard"],
    queryFn: () =>
      candidateApi.list({ page: 1, page_size: 100, sort: "-uploaded_at" }),
  });
  const jobsQuery = useQuery({ queryKey: ["jobs"], queryFn: () => jobsApi.list() });
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
      label: "简历",
      value: String(candidatesQuery.data?.total ?? 0),
      icon: Files,
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
      label: "职位机会",
      value: String(jobsQuery.data?.items.length ?? 0),
      icon: BarChart3,
    },
  ];
  const statusData = useMemo(
    () =>
      (Object.entries(statusLabels) as Array<[CandidateStatus, string]>)
        .map(([status, label]) => ({
          status,
          label: t(label),
          value: candidates.filter((candidate) => candidate.status === status)
            .length,
        }))
        .filter((item) => item.value > 0),
    [candidates, t],
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
      <section className="space-y-8 lg:space-y-10">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("总览")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("简历解析和评分概况")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t(metric.label)}</p>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums">{metric.value}</p>
            </div>
          ))}
        </div>
        {!candidatesQuery.isLoading && !candidates.length ? (
          <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <div className="max-w-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FilePlus2 className="h-5 w-5" />
              </span>
              <h2 className="mt-5 font-display text-xl font-medium">{t("暂无简历")}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("上传第一份简历后，这里会展示解析、评分和求职进度概况。")}
              </p>
              <Button className="mt-5" onClick={() => navigate("/resumes/new")}>
                {t("添加简历")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
              <h2 className="border-b border-border pb-4 font-display text-lg font-medium">
                {t("数据分布")}
              </h2>
              <div className="mt-6 grid gap-8 xl:grid-cols-2">
                <StatusDistributionChart statusData={statusData} />
                <ScoreBarChart scoreData={scoreData} />
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <h2 className="border-b border-border px-5 py-4 font-display text-lg font-medium sm:px-6">
                {t("最近上传")}
              </h2>
              <div className="divide-y divide-border">
                {candidates.slice(0, 6).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between px-5 py-3.5 text-sm table-row-hover hover:bg-muted/30 sm:px-6"
                  >
                    <Link
                      className="transition-colors hover:text-primary"
                      to={`/resumes/${candidate.id}`}
                    >
                      {candidate.name || candidate.original_filename}
                    </Link>
                    <span className="tabular-nums text-muted-foreground">
                      {candidate.total_score ?? "--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </AnimatedPage>
  );
}
