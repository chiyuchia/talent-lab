import type { Dispatch, SetStateAction } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

import type { JobDescription, ScoreCreateResponse } from "../../types/api";
import { Button } from "../ui/button";

interface JobScorePanelProps {
  jobs: JobDescription[];
  selectedJobIds: number[];
  setSelectedJobIds: Dispatch<SetStateAction<number[]>>;
  scoreMutation: UseMutationResult<ScoreCreateResponse, Error, void, unknown>;
}

export function JobScorePanel({
  jobs,
  selectedJobIds,
  setSelectedJobIds,
  scoreMutation,
}: JobScorePanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-medium">岗位评分</h3>
      <div className="mt-4 space-y-2">
        {jobs.map((job) => (
          <label key={job.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedJobIds.includes(job.id)}
              onChange={(event) =>
                setSelectedJobIds((current) =>
                  event.target.checked ? [...current, job.id] : current.filter((id) => id !== job.id),
                )
              }
            />
            {job.title}
          </label>
        ))}
      </div>
      <Button onClick={() => scoreMutation.mutate()} disabled={!selectedJobIds.length || scoreMutation.isPending} className="mt-4">
        {scoreMutation.isPending ? "评分中" : "生成评分"}
      </Button>
      {scoreMutation.isError ? <p className="mt-3 text-sm text-destructive">{scoreMutation.error.message}</p> : null}
    </div>
  );
}
