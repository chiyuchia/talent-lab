import { type FormEvent, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { CandidateSummary, JobOpportunityDraft } from "../../types/api";
import { Button } from "../ui/button";
import { JobApplicationFields } from "./JobApplicationFields";
import { JobBasicFields } from "./JobBasicFields";
import { JobCompensationFields } from "./JobCompensationFields";
import { JobContentFields } from "./JobContentFields";
import { JobRequirementsFields } from "./JobRequirementsFields";
import { JobTextParser } from "./JobTextParser";
import { mergeParsedJob, validateJobForm } from "./job-form";

export type JobForm = JobOpportunityDraft;

type Props = {
  jobId: number | null;
  form: JobOpportunityDraft;
  resumeVersions: CandidateSummary[];
  saving: boolean;
  error: string | null;
  onChange: (form: JobOpportunityDraft) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function JobFormPanel({
  jobId,
  form,
  resumeVersions,
  saving,
  error,
  onChange,
  onCancel,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [parsing, setParsing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const busy = saving || parsing;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateJobForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || busy) return;
    onSubmit();
  }

  function updateForm(next: JobOpportunityDraft) {
    setErrors({});
    onChange(next);
  }

  return (
    <section className="space-y-5">
      <Button variant="ghost" className="-ml-3" onClick={onCancel} disabled={busy}>
        <ArrowLeft className="h-4 w-4" /> {t("返回职位机会")}
      </Button>
      <div>
        <h2 className="text-2xl font-semibold">{t(jobId ? "编辑职位机会" : "添加职位机会")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("结构化职位描述、比较匹配度并跟踪完整申请进度")}</p>
      </div>
      <JobTextParser
        current={form}
        disabled={saving}
        onPendingChange={setParsing}
        onApply={(parsed) => updateForm(mergeParsedJob(form, parsed))}
      />
      <form onSubmit={handleSubmit} className="w-full space-y-6 rounded-lg border border-border bg-card p-5">
        <fieldset disabled={busy} className="space-y-7 disabled:opacity-60">
          <JobBasicFields form={form} onChange={updateForm} errors={errors} />
          <JobContentFields form={form} onChange={updateForm} />
          <JobRequirementsFields form={form} onChange={updateForm} errors={errors} />
          <JobCompensationFields form={form} onChange={updateForm} errors={errors} />
          <JobApplicationFields form={form} onChange={updateForm} resumeVersions={resumeVersions} />
        </fieldset>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="sticky bottom-3 z-10 flex justify-end gap-3 rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
          <Button variant="outline" onClick={onCancel} disabled={busy}>{t("取消")}</Button>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t(parsing ? "正在解析" : saving ? "保存中" : "保存职位机会")}
          </Button>
        </div>
      </form>
    </section>
  );
}
