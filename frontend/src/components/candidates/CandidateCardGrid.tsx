import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { CandidateStatusBadge } from "../StatusBadge";
import { TagList } from "../Tag";
import { Button } from "../ui/button";
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
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isMaxReached}
                onChange={() => toggleCandidate(candidate.id)}
                className="accent-primary h-4 w-4"
                aria-label={`选择 ${candidate.name || candidate.original_filename}`}
              />
            </div>
            <Link to={`/candidates/${candidate.id}`} className="block">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div>
                  <p className="font-medium">
                    {candidate.name || candidate.original_filename}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {candidate.email || candidate.city || "暂无联系方式"}
                  </p>
                </div>
              </div>
              <TagList
                items={candidate.skills}
                limit={5}
                className="mt-4"
              />
              <p className="mt-4 text-sm text-muted-foreground">
                评分：{candidate.total_score ?? "--"}
              </p>
            </Link>
            <div className="mt-3 flex items-center justify-between">
              <CandidateStatusBadge status={candidate.status} />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  if (window.confirm(`确定要删除候选人「${candidate.name || candidate.original_filename}」吗？`)) {
                    deleteMutation.mutate(candidate.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="h-8 w-8"
                aria-label="删除候选人"
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
