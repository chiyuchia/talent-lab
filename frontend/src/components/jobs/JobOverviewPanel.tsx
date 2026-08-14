import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { JobOpportunity } from "../../types/api";
import {
  employmentLabel,
  jobSalaryLabel,
  seniorityLabel,
  workModeLabel,
} from "./job-display";

type Props = { job: JobOpportunity };

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function JobOverviewPanel({ job }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-medium">{t("职位概述")}</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {job.summary || job.raw_jd || t("尚未添加职位描述")}
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-medium">{t("岗位职责")}</h3>
          {job.responsibilities.length ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {job.responsibilities.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t("尚未整理岗位职责")}</p>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-lg border border-border bg-card p-5">
        <h3 className="font-medium">{t("职位信息")}</h3>
        <dl className="mt-3 divide-y divide-border">
          <DetailRow label={t("工作地点")} value={job.locations.join(" / ") || null} />
          <DetailRow label={t("办公方式")} value={workModeLabel(job.work_mode) ? t(workModeLabel(job.work_mode)!) : null} />
          <DetailRow label={t("用工类型")} value={employmentLabel(job) ? t(employmentLabel(job)!) : null} />
          <DetailRow label={t("职级")} value={seniorityLabel(job.seniority) ? t(seniorityLabel(job.seniority)!) : null} />
          <DetailRow label={t("薪酬与待遇")} value={jobSalaryLabel(job)} />
          <DetailRow label={t("团队或业务方向")} value={job.department || null} />
          <DetailRow label={t("公司行业")} value={job.company_industry || null} />
          <DetailRow label={t("公司规模或阶段")} value={job.company_stage || null} />
        </dl>
        {job.source_url ? (
          <a
            href={job.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t("打开职位来源")}<ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </aside>
    </div>
  );
}
