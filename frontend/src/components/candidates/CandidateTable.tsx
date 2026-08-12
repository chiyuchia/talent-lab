import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { CandidateStatusBadge, ParseStatusBadge } from "../StatusBadge";
import { TagList } from "../Tag";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";
import type { CandidateSummary } from "../../types/api";
import type { DeleteCandidateMutation } from "./candidate-list-options";

interface CandidateTableProps {
  candidates: CandidateSummary[];
  selectedIds: number[];
  selectMany: (candidateIds: number[]) => void;
  deselectMany: (candidateIds: number[]) => void;
  toggleCandidate: (candidateId: number) => void;
  deleteMutation: DeleteCandidateMutation;
}

export function CandidateTable({
  candidates,
  selectedIds,
  selectMany,
  deselectMany,
  toggleCandidate,
  deleteMutation,
}: CandidateTableProps) {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card animate-fade-in-up animation-delay-100">
      <table className="w-full min-w-[64rem] border-collapse text-sm">
        <thead className="whitespace-nowrap bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="w-14 px-4 py-3">
              <Checkbox
                checked={
                  candidates.length > 0 &&
                  candidates.every((c) => selectedIds.includes(c.id))
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    const newIds = candidates
                      .map((c) => c.id)
                      .filter(
                        (id, i) =>
                          !selectedIds.includes(id) &&
                          selectedIds.length + i < 3,
                      )
                      .slice(0, 3 - selectedIds.length);
                    selectMany(newIds);
                  } else {
                    deselectMany(candidates.map((c) => c.id));
                  }
                }}
                aria-label={t("全选当前页")}
              />
            </th>
            <th className="px-4 py-3 font-medium">{t("姓名")}</th>
            <th className="px-4 py-3 font-medium">{t("技能")}</th>
            <th className="px-4 py-3 font-medium">{t("评分")}</th>
            <th className="px-4 py-3 font-medium">{t("解析")}</th>
            <th className="px-4 py-3 font-medium">{t("状态")}</th>
            <th className="px-4 py-3 font-medium text-right">{t("操作")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((candidate, index) => {
            const isSelected = selectedIds.includes(candidate.id);
            const isMaxReached = selectedIds.length >= 3 && !isSelected;
            return (
              <tr
                key={candidate.id}
                className={cn(
                  "table-row-hover hover:bg-muted/30",
                  isSelected && "bg-primary/5",
                )}
                style={{
                  animation: `fade-in-up 0.4s ease-out ${0.04 * Math.min(index, 12)}s both`,
                }}
              >
                <td className="px-4 py-4">
                  <Checkbox
                    checked={isSelected}
                    disabled={isMaxReached}
                    onChange={() => toggleCandidate(candidate.id)}
                    aria-label={t("选择 {{name}}", { name: candidate.name || candidate.original_filename })}
                  />
                </td>
                <td className="px-4 py-4">
                  <Link
                    className="font-medium hover:text-primary transition-colors"
                    to={`/candidates/${candidate.id}`}
                  >
                    {candidate.name || candidate.original_filename}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {candidate.email || candidate.city}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <TagList
                    items={candidate.skills}
                    limit={4}
                    className="max-w-sm"
                  />
                </td>
                <td className="px-4 py-4">
                  {candidate.total_score ?? "--"}
                </td>
                <td className="px-4 py-4">
                  <ParseStatusBadge status={candidate.parse_status} />
                </td>
                <td className="px-4 py-4">
                  <CandidateStatusBadge status={candidate.status} />
                </td>
                <td className="px-4 py-4 text-right">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
