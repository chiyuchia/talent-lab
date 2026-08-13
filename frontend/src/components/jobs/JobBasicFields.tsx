import { useTranslation } from "react-i18next";

import type { JobOpportunityDraft } from "../../types/api";
import { TagInput } from "../TagInput";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { EmploymentTypeSelector } from "./EmploymentTypeSelector";
import { JobFormSection } from "./JobFormSection";

type Props = {
  form: JobOpportunityDraft;
  onChange: (form: JobOpportunityDraft) => void;
  errors: Record<string, string>;
};

export function JobBasicFields({ form, onChange, errors }: Props) {
  const { t } = useTranslation();
  const set = (field: keyof JobOpportunityDraft, value: unknown) =>
    onChange({ ...form, [field]: value });

  return (
    <JobFormSection title={t("职位来源与基本信息")} description={t("保存职位出处和工作安排，方便后续比较与追踪。") }>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("公司名称")} required error={errors.company_name ? t(errors.company_name) : undefined}>
          <Input autoFocus required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder={t("例如：星河科技")} />
        </Field>
        <Field label={t("职位名称")} required error={errors.title ? t(errors.title) : undefined}>
          <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={t("例如：高级前端工程师")} />
        </Field>
        <Field label={t("来源平台")}>
          <Input value={form.source_platform} onChange={(e) => set("source_platform", e.target.value)} placeholder={t("例如：公司官网、LinkedIn") } />
        </Field>
        <Field label={t("职位描述链接")} error={errors.source_url ? t(errors.source_url) : undefined}>
          <Input type="url" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} placeholder="https://" />
        </Field>
        <Field label={t("发布日期")}>
          <Input type="date" value={form.published_at ?? ""} onChange={(e) => set("published_at", e.target.value || null)} />
        </Field>
        <Field label={t("申请截止日期")}>
          <Input type="date" value={form.application_deadline ?? ""} onChange={(e) => set("application_deadline", e.target.value || null)} />
        </Field>
        <Field label={t("办公方式")}>
          <Select value={form.work_mode} onChange={(e) => set("work_mode", e.target.value)}>
            <option value="">{t("未指定")}</option>
            <option value="on_site">{t("现场办公")}</option>
            <option value="hybrid">{t("混合办公")}</option>
            <option value="remote">{t("远程办公")}</option>
          </Select>
        </Field>
        <Field label={t("用工类型（可多选）")}>
          <EmploymentTypeSelector value={form.employment_type} onChange={(value) => set("employment_type", value)} />
        </Field>
        <Field label={t("职级")}>
          <Select value={form.seniority} onChange={(e) => set("seniority", e.target.value)}>
            <option value="">{t("未指定")}</option>
            {[
              ["intern", "实习"], ["entry", "初级"], ["mid", "中级"],
              ["senior", "高级"], ["expert", "专家"], ["manager", "管理"],
            ].map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
          </Select>
        </Field>
        <Field label={t("团队或业务方向")}>
          <Input value={form.department} onChange={(e) => set("department", e.target.value)} />
        </Field>
        <Field label={t("公司行业")}>
          <Input value={form.company_industry} onChange={(e) => set("company_industry", e.target.value)} />
        </Field>
        <Field label={t("公司规模或阶段")}>
          <Input value={form.company_stage} onChange={(e) => set("company_stage", e.target.value)} placeholder={t("例如：初创、上市公司") } />
        </Field>
      </div>
      <Field label={t("工作地点")}>
        <TagInput value={form.locations} onChange={(value) => set("locations", value)} placeholder={t("输入城市后按 Enter")} />
      </Field>
    </JobFormSection>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}{required ? <span className="text-destructive"> *</span> : null}</span>
      {children}
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
