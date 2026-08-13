import { useTranslation } from "react-i18next";

import type { JobOpportunityDraft } from "../../types/api";
import { TagInput } from "../TagInput";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { JobFormSection } from "./JobFormSection";
import { NamedRequirementsEditor } from "./NamedRequirementsEditor";
import { SkillRequirementsEditor } from "./SkillRequirementsEditor";
import { StringListEditor } from "./StringListEditor";

type Props = {
  form: JobOpportunityDraft;
  onChange: (form: JobOpportunityDraft) => void;
  errors: Record<string, string>;
};

export function JobRequirementsFields({ form, onChange, errors }: Props) {
  const { t } = useTranslation();
  const set = (field: keyof JobOpportunityDraft, value: unknown) =>
    onChange({ ...form, [field]: value });
  const setConstraint = (field: string, value: string) =>
    set("constraints", { ...form.constraints, [field]: value });
  const numberValue = (value: string) => value === "" ? null : Number(value);

  return (
    <JobFormSection title={t("任职要求")} description={t("结构化要求用于识别匹配项、技能缺口和硬性条件风险。") }>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={t("最低经验年限")}>
          <Input type="number" min="0" step="0.5" value={form.experience_min_years ?? ""} onChange={(e) => set("experience_min_years", numberValue(e.target.value))} />
        </Field>
        <Field label={t("最高经验年限")}>
          <Input type="number" min="0" step="0.5" value={form.experience_max_years ?? ""} onChange={(e) => set("experience_max_years", numberValue(e.target.value))} />
        </Field>
        <Field label={t("最低学历")}>
          <Select value={form.minimum_education} onChange={(e) => set("minimum_education", e.target.value)}>
            <option value="">{t("未指定")}</option>
            {[
              ["high_school", "高中"], ["associate", "大专"], ["bachelor", "本科"],
              ["master", "硕士"], ["doctorate", "博士"], ["other", "其他"],
            ].map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
          </Select>
        </Field>
      </div>
      {errors.experience ? <p className="text-xs text-destructive">{t(errors.experience)}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("优先专业")}>
          <TagInput value={form.preferred_majors} onChange={(value) => set("preferred_majors", value)} placeholder={t("输入专业后按 Enter")} />
        </Field>
        <Field label={t("行业或领域经验")}>
          <TagInput value={form.industry_experience} onChange={(value) => set("industry_experience", value)} placeholder={t("例如：SaaS、金融、电商") } />
        </Field>
      </div>
      <RequirementGroup title={t("技能要求")}>
        <SkillRequirementsEditor value={form.skill_requirements} onChange={(value) => set("skill_requirements", value)} />
      </RequirementGroup>
      <div className="grid gap-5 lg:grid-cols-2">
        <RequirementGroup title={t("语言要求")}>
          <NamedRequirementsEditor kind="language" value={form.language_requirements} onChange={(value) => set("language_requirements", value)} />
        </RequirementGroup>
        <RequirementGroup title={t("证书要求")}>
          <NamedRequirementsEditor kind="certificate" value={form.certification_requirements} onChange={(value) => set("certification_requirements", value)} />
        </RequirementGroup>
      </div>
      <RequirementGroup title={t("限制条件")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("工作许可要求")}><Input value={form.constraints.work_authorization ?? ""} onChange={(e) => setConstraint("work_authorization", e.target.value)} /></Field>
          <Field label={t("签证支持")}><Input value={form.constraints.visa_sponsorship ?? ""} onChange={(e) => setConstraint("visa_sponsorship", e.target.value)} /></Field>
          <Field label={t("出差要求")}><Input value={form.constraints.travel ?? ""} onChange={(e) => setConstraint("travel", e.target.value)} /></Field>
          <Field label={t("搬迁要求")}><Input value={form.constraints.relocation ?? ""} onChange={(e) => setConstraint("relocation", e.target.value)} /></Field>
          <Field label={t("时区要求")}><Input value={form.constraints.timezone ?? ""} onChange={(e) => setConstraint("timezone", e.target.value)} /></Field>
        </div>
      </RequirementGroup>
      <RequirementGroup title={t("其他任职要求")}>
        <StringListEditor value={form.other_requirements} onChange={(value) => set("other_requirements", value)} placeholder={t("输入一条任职要求") } addLabel={t("添加要求") } />
      </RequirementGroup>
    </JobFormSection>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm"><span className="text-muted-foreground">{label}</span>{children}</label>;
}

function RequirementGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-2"><h4 className="text-sm font-medium">{title}</h4>{children}</div>;
}
