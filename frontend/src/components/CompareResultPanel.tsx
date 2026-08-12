import { GitCompare } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { CandidateDetail } from "../types/api";
import { CompareCandidateCard } from "./compare/CompareCandidateCard";

export function CompareResultPanel({
  candidates,
  empty,
}: {
  candidates: CandidateDetail[];
  empty?: React.ReactNode;
}) {
  const { t } = useTranslation();
  if (!candidates.length) {
    return (
      <div className="grid h-80 place-items-center rounded-lg border border-dashed border-border bg-background animate-fade-in">
        <div className="text-center">
          <GitCompare className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">{t("暂无对比对象")}</p>
        </div>
        {empty}
      </div>
    );
  }

  const colCount = candidates.length;

  return (
    <div
      className="grid gap-3 w-full stagger-children"
      style={{
        gridTemplateColumns: `repeat(${colCount}, minmax(260px, 1fr))`,
      }}
    >
      {candidates.map((candidate) => (
        <CompareCandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}
