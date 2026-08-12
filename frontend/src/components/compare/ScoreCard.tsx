import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { scoreTierBarClass } from "../../lib/format";
import { cn } from "../../lib/utils";
import type { ScoreResult } from "../../types/api";

function ScoreBar({
  label,
  score,
  max = 100,
}: {
  label: string;
  score: number;
  max?: number;
}) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", scoreTierBarClass(score))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right tabular-nums text-muted-foreground">
        {score}
      </span>
    </div>
  );
}

export function ScoreCard({ score }: { score: ScoreResult }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium truncate">{score.job_title}</p>
        <span className="shrink-0 text-lg font-bold tabular-nums text-primary">
          {score.total_score}
        </span>
      </div>
      <div className="mt-2 space-y-1">
        <ScoreBar label="技能" score={score.skill_score} />
        <ScoreBar label="经验" score={score.experience_score} />
        <ScoreBar label="教育" score={score.education_score} />
      </div>
      {score.ai_comment ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> 收起评价
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> 展开评价
              </>
            )}
          </button>
          {expanded ? (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground animate-fade-in">
              {score.ai_comment}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
