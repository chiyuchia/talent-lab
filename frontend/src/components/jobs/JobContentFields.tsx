import { useTranslation } from "react-i18next";

import type { JobOpportunityDraft } from "../../types/api";
import { Textarea } from "../ui/input";
import { JobFormSection } from "./JobFormSection";
import { StringListEditor } from "./StringListEditor";

type Props = {
  form: JobOpportunityDraft;
  onChange: (form: JobOpportunityDraft) => void;
};

export function JobContentFields({ form, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <JobFormSection title={t("职位内容")} description={t("结构化内容用于匹配分析，职位描述原文用于追溯和重新解析。") }>
      <label className="block space-y-1.5 text-sm">
        <span className="text-muted-foreground">{t("职位摘要")}</span>
        <Textarea value={form.summary} onChange={(e) => onChange({ ...form, summary: e.target.value })} className="min-h-24" placeholder={t("用几句话概括岗位目标和核心工作") } />
      </label>
      <div className="space-y-2 text-sm">
        <span className="text-muted-foreground">{t("岗位职责")}</span>
        <StringListEditor value={form.responsibilities} onChange={(responsibilities) => onChange({ ...form, responsibilities })} placeholder={t("输入一条岗位职责") } addLabel={t("添加职责") } />
      </div>
      <label className="block space-y-1.5 text-sm">
        <span className="flex items-center justify-between text-muted-foreground">
          <span>{t("职位描述原文")}</span>
          <span className="text-xs tabular-nums">{form.raw_jd.length} / 20000</span>
        </span>
        <Textarea maxLength={20000} value={form.raw_jd} onChange={(e) => onChange({ ...form, raw_jd: e.target.value })} className="min-h-52 leading-6" />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="text-muted-foreground">{t("其他职位说明")}</span>
        <Textarea value={form.other_information} onChange={(e) => onChange({ ...form, other_information: e.target.value })} />
      </label>
    </JobFormSection>
  );
}
