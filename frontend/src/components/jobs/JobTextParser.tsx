import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, ChevronDown, ClipboardPaste, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { jobsApi } from "../../lib/api";
import { getErrorMessage } from "../../lib/errors";
import type { JobOpportunityDraft, JobParseResult } from "../../types/api";
import { Button } from "../ui/button";
import { Textarea } from "../ui/input";

const MAX_JOB_TEXT_LENGTH = 20_000;
const fieldLabels: Record<string, string> = {
  company_name: "公司名称",
  title: "职位名称",
  raw_jd: "职位描述原文",
  summary: "职位摘要",
  locations: "工作地点",
  work_mode: "办公方式",
  employment_type: "用工类型",
  seniority: "职级",
  department: "团队或业务方向",
  responsibilities: "岗位职责",
  experience_min_years: "最低经验年限",
  experience_max_years: "最高经验年限",
  minimum_education: "最低学历",
  skill_requirements: "技能要求",
  language_requirements: "语言要求",
  certification_requirements: "证书要求",
  other_requirements: "其他任职要求",
  salary_min: "最低薪资",
  salary_max: "最高薪资",
  salary_currency: "币种",
  salary_period: "计薪周期",
  benefits: "福利",
};

const valueLabels: Record<string, string> = {
  full_time: "全职",
  part_time: "兼职",
  internship: "实习",
  contract: "合同",
  on_site: "现场办公",
  hybrid: "混合办公",
  remote: "远程办公",
  senior: "高级",
  bachelor: "本科",
  hour: "时薪",
  month: "月薪",
  year: "年薪",
};

function previewValue(value: unknown, translate: (key: string) => string): string {
  if (value === null || value === undefined || value === "") return "-";
  const translateValue = (item: unknown) => {
    const text = typeof item === "object" && item
      ? (item as { name?: string }).name || JSON.stringify(item)
      : String(item);
    return valueLabels[text] ? translate(valueLabels[text]) : text;
  };
  const text = Array.isArray(value)
    ? value.map(translateValue).join("、")
    : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (!text) return "-";
  const display = translateValue(text);
  return display.length > 72 ? `${display.slice(0, 72)}…` : display;
}

type Props = {
  current: JobOpportunityDraft;
  disabled: boolean;
  onApply: (job: JobParseResult) => void;
  onPendingChange: (pending: boolean) => void;
};

export function JobTextParser({ current, disabled, onApply, onPendingChange }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState(current.raw_jd);
  const [preview, setPreview] = useState<JobParseResult | null>(null);
  const parseMutation = useMutation({
    mutationFn: jobsApi.parse,
    onMutate: () => onPendingChange(true),
    onSuccess: setPreview,
    onSettled: () => onPendingChange(false),
  });
  useEffect(() => setText(current.raw_jd), [current.raw_jd]);
  const changes = useMemo(() => {
    if (!preview) return [];
    return Object.entries(preview).filter(([key, value]) =>
      key in current && JSON.stringify(current[key as keyof JobOpportunityDraft]) !== JSON.stringify(value)
    );
  }, [current, preview]);

  function updateText(value: string) {
    setText(value);
    setPreview(null);
    if (parseMutation.isError || parseMutation.isSuccess) parseMutation.reset();
  }

  return (
    <details open={!current.raw_jd} className="group rounded-lg border border-primary/25 bg-primary/5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
        <span className="flex items-center gap-3">
          <span className="rounded-md bg-primary/10 p-2 text-primary"><Sparkles className="h-4 w-4" /></span>
          <span><strong className="block text-sm">{t("粘贴职位描述，自动创建职位机会")}</strong><span className="mt-0.5 block text-xs text-muted-foreground">{t("解析结果会先预览，由你确认后再应用。")}</span></span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-primary/15 p-4">
        <Textarea autoFocus={!current.raw_jd} value={text} disabled={disabled || parseMutation.isPending} maxLength={MAX_JOB_TEXT_LENGTH} onChange={(e) => updateText(e.target.value)} placeholder={t("在这里粘贴完整的职位描述...")} className="min-h-44 bg-background leading-6" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs tabular-nums text-muted-foreground">{t("{{value}} / {{max}} 字符", { value: text.length, max: MAX_JOB_TEXT_LENGTH })}</span>
          <Button size="sm" disabled={disabled || parseMutation.isPending || !text.trim()} onClick={() => parseMutation.mutate(text)}>
            {parseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardPaste className="h-4 w-4" />}
            {t(parseMutation.isPending ? "正在解析" : "解析职位描述")}
          </Button>
        </div>
        {parseMutation.isError ? <p className="mt-2 text-xs text-destructive">{getErrorMessage(parseMutation.error)}</p> : null}
        {preview ? (
          <div className="mt-4 rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{preview.company_name || t("待补充公司")} · {preview.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("检测到 {{count}} 个字段变化、{{skills}} 项技能和 {{duties}} 条职责", { count: changes.length, skills: preview.skill_requirements?.length ?? 0, duties: preview.responsibilities?.length ?? 0 })}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { onApply(preview); setPreview(null); }}>
                <Check className="h-4 w-4" /> {t("应用解析结果")}
              </Button>
            </div>
            <div className="mt-3 max-h-52 space-y-2 overflow-auto border-t border-border pt-3">
              {changes.slice(0, 12).map(([key, value]) => (
                <div key={key} className="grid gap-1 text-xs sm:grid-cols-[8rem_1fr]">
                  <span className="font-medium">{t(fieldLabels[key] ?? key)}</span>
                  <span className="text-muted-foreground">
                    <span className="line-through opacity-60">{previewValue(current[key as keyof JobOpportunityDraft], t)}</span>
                    <span className="mx-1">→</span>{previewValue(value, t)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-warning">{t("应用后会覆盖已解析出的岗位字段，但保留申请进度和个人笔记。")}</p>
          </div>
        ) : null}
      </div>
    </details>
  );
}
