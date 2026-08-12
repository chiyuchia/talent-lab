import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { CandidateStatusBadge } from "../StatusBadge";
import { TagList } from "../Tag";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";
import type { CandidateSummary } from "../../types/api";
import type { DeleteCandidateMutation } from "./candidate-list-options";

interface CandidateCardGridProps {
  candidates: CandidateSummary[];
  selectedIds: number[];
  toggleCandidate: (candidateId: number) => void;
  deleteMutation: DeleteCandidateMutation;
}

export function CandidateCardGrid({
  candidates,
  selectedIds,
  toggleCandidate,
  deleteMutation,
}: CandidateCardGridProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger-children">
      {candidates.map((candidate) => {
        const isSelected = selectedIds.includes(candidate.id);
        const isMaxReached = selectedIds.length >= 3 && !isSelected;
        return (
          <div
            key={candidate.id}
            className={cn(
              "card-hover relative rounded-lg border p-4 transition-colors",
              isSelected
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card hover:bg-muted/50",
            )}
          >
            <div className="absolute right-3 top-3">
              <Checkbox
                checked={isSelected}
                disabled={isMaxReached}
                onChange={() => toggleCandidate(candidate.id)}
                aria-label={t("选择 {{name}}", { name: candidate.name || candidate.original_filename })}
              />
            </div>
            <Link to={`/candidates/${candidate.id}`} className="block">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div>
                  <p className="font-medium">
                    {candidate.name || candidate.original_filename}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {candidate.email || candidate.city || t("暂无联系方式")}
                  </p>
                </div>
              </div>
              <TagList
                items={candidate.skills}
                limit={5}
                className="mt-4"
              />
              <p className="mt-4 text-sm text-muted-foreground">
                {t("评分：{{value}}", { value: candidate.total_score ?? "--" })}
              </p>
            </Link>
            <div className="mt-3 flex items-center justify-between">
              <CandidateStatusBadge status={candidate.status} />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  if (window.confirm(t("确定要删除候选人「{{name}}」吗？", { name: candidate.name || candidate.original_filename }))) {
                    deleteMutation.mutate(candidate.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="h-8 w-8"
                aria-label={t("删除候选人")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
