import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, Edit3, Heart, MapPin, PanelRightOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { applicationStatusLabel } from "../../lib/job-options";
import type { ApplicationStatus, CandidateSummary, JobOpportunity } from "../../types/api";
import { Badge, type BadgeVariant } from "../ui/badge";
import { Button } from "../ui/button";
import { JobApplicationOverview } from "./JobApplicationOverview";
import { JobMatchesPanel } from "./JobMatchesPanel";
import { JobOverviewPanel } from "./JobOverviewPanel";
import { JobRequirementsOverview } from "./JobRequirementsOverview";
import { JobTimeline } from "./JobTimeline";
import { dateLabel } from "./job-display";

type WorkspaceTab = "overview" | "requirements" | "matches" | "application";

type Props = {
  job: JobOpportunity;
  resumeVersions: CandidateSummary[];
  favoriting: boolean;
  onBack: () => void;
  onEdit: () => void;
  onOpenSource: () => void;
  onToggleFavorite: () => void;
  onStatusChange: (status: ApplicationStatus) => void;
};

function statusVariant(status: ApplicationStatus): BadgeVariant {
  if (["offer", "accepted"].includes(status)) return "success";
  if (["assessment", "interview"].includes(status)) return "warning";
  if (["rejected", "withdrawn"].includes(status)) return "destructive";
  return "outline";
}

export function JobWorkspace({
  job,
  resumeVersions,
  favoriting,
  onBack,
  onEdit,
  onOpenSource,
  onToggleFavorite,
  onStatusChange,
}: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const tabs: Array<{ id: WorkspaceTab; label: string }> = [
    { id: "overview", label: t("概览") },
    { id: "requirements", label: t("任职要求") },
    { id: "matches", label: t("简历匹配") },
    { id: "application", label: t("申请进度") },
  ];

  useEffect(() => setActiveTab("overview"), [job.id]);

  return (
    <section className="space-y-5">
      <Button variant="ghost" className="-ml-3" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />{t("返回职位机会")}
      </Button>

      <header className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(job.application_status)}>{t(applicationStatusLabel(job.application_status))}</Badge>
              {job.priority === "high" ? <Badge variant="warning">{t("高优先级")}</Badge> : null}
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">{job.title}</h2>
            <p className="mt-1 text-base text-muted-foreground">{job.company_name}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {job.locations.length ? <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.locations.join(" / ")}</span> : null}
              {job.next_action_at ? <span className="flex items-center gap-1.5"><CalendarClock className="h-4 w-4" />{t("下一步 {{date}}", { date: dateLabel(job.next_action_at) })}</span> : null}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={onOpenSource} aria-haspopup="dialog">
              <PanelRightOpen className="h-4 w-4" />{t("原始职位信息")}
            </Button>
            <Button variant="outline" size="icon" onClick={onToggleFavorite} disabled={favoriting} aria-pressed={job.is_favorite} aria-label={t(job.is_favorite ? "取消收藏 {{name}}" : "收藏 {{name}}", { name: job.title })}>
              <Heart className={`h-4 w-4 ${job.is_favorite ? "fill-warning text-warning" : ""}`} />
            </Button>
            <Button onClick={onEdit}><Edit3 className="h-4 w-4" />{t("编辑职位信息")}</Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">{t("当前状态")}</p><p className="mt-1 text-sm font-medium">{t(applicationStatusLabel(job.application_status))}</p></div>
          <div><p className="text-xs text-muted-foreground">{t("个人优先级")}</p><p className="mt-1 text-sm font-medium">{t(job.priority === "high" ? "高" : job.priority === "low" ? "低" : "中")}</p></div>
          <div><p className="text-xs text-muted-foreground">{t("下一步行动")}</p><p className="mt-1 truncate text-sm font-medium">{job.next_action || t("尚未安排")}</p></div>
          <div><p className="text-xs text-muted-foreground">{t("申请截止日期")}</p><p className="mt-1 text-sm font-medium">{dateLabel(job.application_deadline) || t("未指定")}</p></div>
        </div>
      </header>

      <div className="overflow-x-auto border-b border-border" role="tablist" aria-label={t("职位工作台分区")}>
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`job-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div id={`job-panel-${activeTab}`} role="tabpanel" className="view-transition-enter">
        {activeTab === "overview" ? <JobOverviewPanel job={job} /> : null}
        {activeTab === "requirements" ? <JobRequirementsOverview job={job} /> : null}
        {activeTab === "matches" ? <JobMatchesPanel jobId={job.id} resumeVersions={resumeVersions} /> : null}
        {activeTab === "application" ? (
          <div className="space-y-5">
            <JobApplicationOverview job={job} resumeVersions={resumeVersions} />
            <JobTimeline jobId={job.id} onStatusChange={onStatusChange} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
