import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TagInput } from "../TagInput";
import { Button } from "../ui/button";
import { Input, Textarea } from "../ui/input";

export type JobForm = {
  title: string;
  description: string;
  required_skills: string[];
  bonus_skills: string[];
};

type JobFormPanelProps = {
  form: JobForm;
  editing: boolean;
  saving: boolean;
  error: string | null;
  onChange: (form: JobForm) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function JobFormPanel({
  form,
  editing,
  saving,
  error,
  onChange,
  onCancel,
  onSubmit,
}: JobFormPanelProps) {
  const { t } = useTranslation();
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section className="space-y-5">
      <Button variant="ghost" className="-ml-3" onClick={onCancel} disabled={saving}>
        <ArrowLeft className="h-4 w-4" />
        {t("返回岗位列表")}
      </Button>

      <div className="animate-fade-in-down">
        <h2 className="text-2xl font-semibold">{t(editing ? "编辑岗位" : "创建岗位")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(editing ? "修改岗位描述和技能要求" : "填写岗位描述和技能要求")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-4 rounded-lg border border-border bg-card p-5 animate-fade-in-up">
        <label className="block text-sm" htmlFor="job-title">
          <span className="text-muted-foreground">{t("岗位名称")}</span>
          <Input
            id="job-title"
            required
            autoFocus
            disabled={saving}
            value={form.title}
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            className="mt-1 h-11"
          />
        </label>

        <label className="block text-sm" htmlFor="job-description">
          <span className="text-muted-foreground">{t("岗位描述")}</span>
          <Textarea
            id="job-description"
            required
            disabled={saving}
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            className="mt-1 min-h-72 p-4"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="text-muted-foreground">{t("必备技能")}</span>
            <TagInput
              value={form.required_skills}
              onChange={(required_skills) => onChange({ ...form, required_skills })}
              className="mt-1"
              placeholder={t("添加必备技能")}
              inputLabel={t("必备技能")}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">{t("加分技能")}</span>
            <TagInput
              value={form.bonus_skills}
              onChange={(bonus_skills) => onChange({ ...form, bonus_skills })}
              className="mt-1"
              placeholder={t("添加加分技能")}
              inputLabel={t("加分技能")}
            />
          </label>
        </div>

        {error ? <p className="text-sm text-destructive animate-fade-in">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onCancel} disabled={saving}>{t("取消")}</Button>
          <Button type="submit" disabled={saving}>
            {t(saving ? "保存中" : editing ? "保存修改" : "创建岗位")}
          </Button>
        </div>
      </form>
    </section>
  );
}
