import { CalendarClock, Heart, MapPin, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { applicationStatusLabel } from "../../lib/job-options";
import type { JobOpportunity } from "../../types/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type Props = {
  job: JobOpportunity;
  highlighted: boolean;
  deleting: boolean;
  favoriting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
};

function salaryLabel(job: JobOpportunity): string | null {
  if (job.salary_min === null && job.salary_max === null) return null;
  const range = [job.salary_min, job.salary_max]
    .filter((value) => value !== null)
    .map((value) => Number(value).toLocaleString())
    .join(" – ");
  return `${job.salary_currency || ""} ${range}/${job.salary_period || "?"}`.trim();
}

export function JobOpportunityCard({ job, highlighted, deleting, favoriting, onEdit, onDelete, onToggleFavorite }: Props) {
  const { t } = useTranslation();
  const salary = salaryLabel(job);
  const hasMetadata = job.locations.length > 0 || Boolean(salary) || Boolean(job.next_action);
  return (
    <article
      className={`card-hover flex h-full flex-col rounded-md border bg-background p-4 transition-colors ${
        highlighted ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
          <span className="block truncate font-medium transition-colors hover:text-primary">{job.title}</span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-2 -mt-2 h-9 w-9 shrink-0"
          disabled={favoriting}
          onClick={onToggleFavorite}
          aria-pressed={job.is_favorite}
          aria-label={t(job.is_favorite ? "取消收藏 {{name}}" : "收藏 {{name}}", { name: job.title })}
        >
          <Heart className={`h-4 w-4 ${job.is_favorite ? "fill-warning text-warning" : "text-muted-foreground"}`} />
        </Button>
      </div>
      <div className="mt-1 flex min-w-0 items-center gap-2">
        {job.company_name ? <span className="min-w-0 truncate text-sm text-muted-foreground">{job.company_name}</span> : null}
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <Badge className="px-1.5 py-0" variant="outline">{t(applicationStatusLabel(job.application_status))}</Badge>
          {job.priority === "high" ? <Badge className="px-1.5 py-0" variant="warning">{t("高优先级")}</Badge> : null}
        </span>
      </div>
      <p className={`mt-3 text-sm leading-5 text-muted-foreground ${hasMetadata ? "line-clamp-3 min-h-15" : "line-clamp-4 min-h-20"}`}>
        {job.summary || job.raw_jd || t("尚未添加职位描述")}
      </p>
      {hasMetadata ? (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {job.locations.length ? (
            <p className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.locations.join("、")}
            </p>
          ) : null}
          {salary ? <p>{salary}</p> : null}
          {job.next_action ? <p className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{job.next_action}</p> : null}
        </div>
      ) : null}
      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-xs text-muted-foreground">
            {t("{{value}} 项技能要求", { value: job.skill_requirements.length })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={deleting}
            onClick={onDelete}
            aria-label={t("删除职位机会 {{name}}", { name: job.title })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  );
}
