import { useTranslation } from "react-i18next";

import type { JobOpportunityDraft } from "../../types/api";
import { TagInput } from "../TagInput";
import { Input, Textarea } from "../ui/input";
import { Select } from "../ui/select";
import { JobFormSection } from "./JobFormSection";

type Props = {
  form: JobOpportunityDraft;
  onChange: (form: JobOpportunityDraft) => void;
  errors: Record<string, string>;
};

export function JobCompensationFields({ form, onChange, errors }: Props) {
  const { t } = useTranslation();
  const set = (field: keyof JobOpportunityDraft, value: unknown) =>
    onChange({ ...form, [field]: value });
  const numberValue = (value: string) => value === "" ? null : Number(value);
  return (
    <JobFormSection title={t("薪酬与待遇")} description={t("统一记录薪资口径，便于不同职位之间横向比较。") }>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label={t("最低薪资")}><Input type="number" min="0" value={form.salary_min ?? ""} onChange={(e) => set("salary_min", numberValue(e.target.value))} /></Field>
        <Field label={t("最高薪资")}><Input type="number" min="0" value={form.salary_max ?? ""} onChange={(e) => set("salary_max", numberValue(e.target.value))} /></Field>
        <Field label={t("币种")}><Input maxLength={8} value={form.salary_currency} onChange={(e) => set("salary_currency", e.target.value.toUpperCase())} placeholder="CNY" /></Field>
        <Field label={t("计薪周期")}>
          <Select value={form.salary_period} onChange={(e) => set("salary_period", e.target.value)}>
            <option value="">{t("未指定")}</option>
            <option value="hour">{t("时薪")}</option>
            <option value="month">{t("月薪")}</option>
            <option value="year">{t("年薪")}</option>
          </Select>
        </Field>
      </div>
      {errors.salary ? <p className="text-xs text-destructive">{t(errors.salary)}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("奖金说明")}><Textarea value={form.bonus_compensation} onChange={(e) => set("bonus_compensation", e.target.value)} /></Field>
        <Field label={t("股权说明")}><Textarea value={form.equity} onChange={(e) => set("equity", e.target.value)} /></Field>
      </div>
      <Field label={t("福利")}>
        <TagInput value={form.benefits} onChange={(value) => set("benefits", value)} placeholder={t("例如：补充医疗、年度奖金") } />
      </Field>
    </JobFormSection>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm"><span className="text-muted-foreground">{label}</span>{children}</label>;
}
