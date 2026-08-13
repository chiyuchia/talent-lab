import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { applicationStatusOptions } from "../../lib/job-options";
import type { CandidateSummary, JobOpportunityDraft } from "../../types/api";
import { Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";
import { ContactsEditor } from "./ContactsEditor";
import { JobFormSection } from "./JobFormSection";
import { StringListEditor } from "./StringListEditor";
import { toDateTimeInput } from "./job-form";

type Props = {
  form: JobOpportunityDraft;
  onChange: (form: JobOpportunityDraft) => void;
  resumeVersions: CandidateSummary[];
};

export function JobApplicationFields({ form, onChange, resumeVersions }: Props) {
  const { t } = useTranslation();
  const set = (field: keyof JobOpportunityDraft, value: unknown) =>
    onChange({ ...form, [field]: value });
  return (
    <JobFormSection title={t("我的申请")} description={t("记录个人判断、实际投递版本和下一步行动。") }>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={t("申请状态")}>
          <Select value={form.application_status} onChange={(e) => set("application_status", e.target.value)}>
            {applicationStatusOptions.map(({ value, label }) => (
              <option key={value} value={value}>{t(label)}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("个人优先级")}>
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            <option value="low">{t("低")}</option>
            <option value="medium">{t("中")}</option>
            <option value="high">{t("高")}</option>
          </Select>
        </Field>
        <label className="flex items-center gap-2 self-end rounded-md border border-border bg-background px-3 py-2.5 text-sm">
          <input type="checkbox" checked={form.is_favorite} onChange={(e) => set("is_favorite", e.target.checked)} className="h-4 w-4 accent-primary" />
          <Heart className={`h-4 w-4 ${form.is_favorite ? "fill-warning text-warning" : "text-muted-foreground"}`} /> {t("收藏此职位")}
        </label>
        <Field label={t("投递时间")}>
          <Input type="datetime-local" value={toDateTimeInput(form.applied_at)} onChange={(e) => set("applied_at", e.target.value || null)} />
        </Field>
        <Field label={t("下一步日期")}>
          <Input type="datetime-local" value={toDateTimeInput(form.next_action_at)} onChange={(e) => set("next_action_at", e.target.value || null)} />
        </Field>
        <Field label={t("实际投递的简历版本")}>
          <Select value={form.submitted_resume_id ?? ""} onChange={(e) => set("submitted_resume_id", e.target.value ? Number(e.target.value) : null)}>
            <option value="">{t("尚未选择")}</option>
            {resumeVersions.map((resume) => (
              <option key={resume.id} value={resume.id}>{resume.name || resume.original_filename}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t("下一步行动")}>
        <Input value={form.next_action} onChange={(e) => set("next_action", e.target.value)} placeholder={t("例如：周五前完成简历定制") } />
      </Field>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{t("联系人")}</h4>
        <ContactsEditor value={form.contacts} onChange={(value) => set("contacts", value)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <ListGroup title={t("吸引我的点")} value={form.attraction_points} onChange={(value) => set("attraction_points", value)} placeholder={t("记录职位吸引力") } />
        <ListGroup title={t("顾虑")} value={form.concerns} onChange={(value) => set("concerns", value)} placeholder={t("记录需要确认的风险") } />
      </div>
      <Field label={t("个人备注")}>
        <Textarea value={form.personal_notes} onChange={(e) => set("personal_notes", e.target.value)} className="min-h-28" />
      </Field>
    </JobFormSection>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm"><span className="text-muted-foreground">{label}</span>{children}</label>;
}

function ListGroup({ title, value, onChange, placeholder }: { title: string; value: string[]; onChange: (value: string[]) => void; placeholder: string }) {
  return <div className="space-y-2"><h4 className="text-sm font-medium">{title}</h4><StringListEditor value={value} onChange={onChange} placeholder={placeholder} /></div>;
}
