import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { scoresApi } from "../../lib/api";
import { getErrorMessage } from "../../lib/errors";
import type { CandidateSummary } from "../../types/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type Props = { jobId: number; resumeVersions: CandidateSummary[] };

export function JobMatchesPanel({ jobId, resumeVersions }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const scoresQuery = useQuery({
    queryKey: ["scores", "job", jobId],
    queryFn: () => scoresApi.list({ job_id: jobId }),
  });
  const scoreByResume = useMemo(
    () => new Map((scoresQuery.data?.items ?? []).map((score) => [score.candidate_id, score])),
    [scoresQuery.data?.items],
  );
  const matchMutation = useMutation({
    mutationFn: () => Promise.all(selectedIds.map((candidateId) => scoresApi.create(candidateId, [jobId]))),
    onSuccess: async () => {
      setSelectedIds([]);
      await queryClient.invalidateQueries({ queryKey: ["scores", "job", jobId] });
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  function toggle(candidateId: number) {
    setSelectedIds((current) => current.includes(candidateId)
      ? current.filter((id) => id !== candidateId)
      : [...current, candidateId]);
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{t("多版简历匹配")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("选择一份或多份简历，分别计算并保留匹配结果。")}</p>
        </div>
        <Button size="sm" disabled={!selectedIds.length || matchMutation.isPending} onClick={() => matchMutation.mutate()}>
          {matchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {t("分析所选简历（{{count}}）", { count: selectedIds.length })}
        </Button>
      </div>
      {matchMutation.isError ? <p className="text-sm text-destructive">{getErrorMessage(matchMutation.error)}</p> : null}
      <div className="grid gap-2 md:grid-cols-2">
        {resumeVersions.map((resume) => {
          const score = scoreByResume.get(resume.id);
          return (
            <label key={resume.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background p-3 text-sm">
              <input type="checkbox" checked={selectedIds.includes(resume.id)} onChange={() => toggle(resume.id)} className="h-4 w-4 accent-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{resume.name || resume.original_filename}</span>
                <span className="block truncate text-xs text-muted-foreground">{resume.original_filename}</span>
              </span>
              {score ? (
                <Badge variant={score.total_score >= 70 ? "success" : score.total_score >= 50 ? "warning" : "outline"}>
                  <CheckCircle2 className="mr-1 h-3 w-3" />{score.total_score}
                </Badge>
              ) : <span className="text-xs text-muted-foreground">{t("未分析")}</span>}
            </label>
          );
        })}
      </div>
      {!resumeVersions.length ? <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{t("请先上传一份简历")}</p> : null}
    </section>
  );
}
