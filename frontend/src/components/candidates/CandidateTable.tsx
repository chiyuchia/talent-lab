import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { CandidateStatusBadge, ParseStatusBadge } from "../StatusBadge";
import { TagList } from "../Tag";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
    <Table
      className="min-w-[64rem]"
      containerClassName="view-transition-enter"
    >
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">
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
          </TableHead>
          <TableHead>{t("姓名")}</TableHead>
          <TableHead>{t("技能")}</TableHead>
          <TableHead>{t("评分")}</TableHead>
          <TableHead>{t("解析")}</TableHead>
          <TableHead>{t("状态")}</TableHead>
          <TableHead className="text-right">{t("操作")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => {
          const isSelected = selectedIds.includes(candidate.id);
          const isMaxReached = selectedIds.length >= 3 && !isSelected;
          return (
            <TableRow
              key={candidate.id}
              className={cn(
                "table-row-hover hover:bg-muted/30",
                isSelected && "bg-primary/5",
              )}
            >
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  disabled={isMaxReached}
                  onChange={() => toggleCandidate(candidate.id)}
                  aria-label={t("选择 {{name}}", { name: candidate.name || candidate.original_filename })}
                />
              </TableCell>
              <TableCell>
                <Link
                  className="font-medium hover:text-primary transition-colors"
                  to={`/candidates/${candidate.id}`}
                >
                  {candidate.name || candidate.original_filename}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {candidate.email || candidate.city}
                </p>
              </TableCell>
              <TableCell>
                <TagList
                  items={candidate.skills}
                  limit={4}
                  className="max-w-sm"
                />
              </TableCell>
              <TableCell>
                {candidate.total_score ?? "--"}
              </TableCell>
              <TableCell>
                <ParseStatusBadge status={candidate.parse_status} />
              </TableCell>
              <TableCell>
                <CandidateStatusBadge status={candidate.status} />
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
