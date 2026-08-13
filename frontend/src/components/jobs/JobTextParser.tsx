import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ClipboardPaste, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { jobsApi } from "../../lib/api";
import { getErrorMessage } from "../../lib/errors";
import type { JobDraft } from "../../types/api";
import { Button } from "../ui/button";
import { Textarea } from "../ui/input";

const MAX_JOB_TEXT_LENGTH = 20_000;

type JobTextParserProps = {
  disabled: boolean;
  onParsed: (job: JobDraft) => void;
};

export function JobTextParser({ disabled, onParsed }: JobTextParserProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const parseMutation = useMutation({
    mutationFn: jobsApi.parse,
    onSuccess: onParsed,
  });

  function updateText(value: string) {
    setText(value);
    if (parseMutation.isError || parseMutation.isSuccess) parseMutation.reset();
  }

  return (
    <div className="rounded-md border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <span className="rounded-md bg-primary/10 p-2 text-primary" aria-hidden="true">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-medium">{t("粘贴 JD，自动提取岗位信息")}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("粘贴完整的职位描述，AI 会识别岗位名称、必备技能和加分技能。")}
          </p>
        </div>
      </div>

      <label className="mt-3 block text-sm" htmlFor="job-source-text">
        <span className="sr-only">{t("JD 原文")}</span>
        <Textarea
          id="job-source-text"
          value={text}
          disabled={disabled || parseMutation.isPending}
          maxLength={MAX_JOB_TEXT_LENGTH}
          onChange={(event) => updateText(event.target.value)}
          placeholder={t("在这里粘贴完整的职位描述...")}
          className="min-h-36 bg-background p-3"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs tabular-nums text-muted-foreground">
          {t("{{value}} / {{max}} 字符", { value: text.length, max: MAX_JOB_TEXT_LENGTH })}
        </span>
        <Button
          size="sm"
          disabled={disabled || parseMutation.isPending || !text.trim()}
          onClick={() => parseMutation.mutate(text)}
        >
          {parseMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ClipboardPaste className="h-4 w-4" />
          )}
          {t(parseMutation.isPending ? "正在解析" : "解析 JD")}
        </Button>
      </div>

      <div className="mt-2 min-h-5 text-xs" aria-live="polite">
        {parseMutation.isError ? (
          <p className="text-destructive">{getErrorMessage(parseMutation.error)}</p>
        ) : null}
        {parseMutation.isSuccess ? (
          <p className="text-success">{t("解析完成，已填入下方表单，请确认后保存。")}</p>
        ) : null}
      </div>
    </div>
  );
}
