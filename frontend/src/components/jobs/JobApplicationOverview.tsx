import { CalendarClock, ContactRound, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { CandidateSummary, JobOpportunity } from "../../types/api";
import { dateLabel } from "./job-display";

type Props = { job: JobOpportunity; resumeVersions: CandidateSummary[] };

function NotesCard({ title, items }: { title: string; items: string[] }) {
  const { t } = useTranslation();
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-medium">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : <p className="mt-3 text-sm text-muted-foreground">{t("尚未添加")}</p>}
    </section>
  );
}

export function JobApplicationOverview({ job, resumeVersions }: Props) {
  const { t } = useTranslation();
  const submittedResume = resumeVersions.find((resume) => resume.id === job.submitted_resume_id);
  return (
    <div className="space-y-5">
      <section className="grid gap-3 rounded-lg border border-border bg-card p-5 md:grid-cols-3">
        <div className="flex gap-3">
          <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
          <div><p className="text-xs text-muted-foreground">{t("下一步行动")}</p><p className="mt-1 text-sm font-medium">{job.next_action || t("尚未安排")}</p></div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("下一步日期")}</p>
          <p className="mt-1 text-sm font-medium">{dateLabel(job.next_action_at) || t("未指定")}</p>
        </div>
        <div className="flex gap-3">
          <FileText className="mt-0.5 h-4 w-4 text-primary" />
          <div><p className="text-xs text-muted-foreground">{t("实际投递的简历版本")}</p><p className="mt-1 text-sm font-medium">{submittedResume?.name || submittedResume?.original_filename || t("尚未选择")}</p></div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <NotesCard title={t("吸引我的点")} items={job.attraction_points} />
        <NotesCard title={t("顾虑")} items={job.concerns} />
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-medium">{t("个人备注")}</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{job.personal_notes || t("尚未添加")}</p>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-medium"><ContactRound className="h-4 w-4 text-primary" />{t("联系人")}</h3>
        {job.contacts.length ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {job.contacts.map((contact, index) => (
              <article key={`${contact.contact}-${index}`} className="rounded-md border border-border bg-background p-3">
                <p className="text-sm font-medium">{contact.name || t("未命名联系人")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{[contact.role, contact.contact].filter(Boolean).join(" - ")}</p>
                {contact.notes ? <p className="mt-2 text-xs text-muted-foreground">{contact.notes}</p> : null}
              </article>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-muted-foreground">{t("尚未添加联系人")}</p>}
      </section>
    </div>
  );
}
