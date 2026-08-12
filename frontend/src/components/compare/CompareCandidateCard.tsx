import { Briefcase, GraduationCap, Mail, MapPin } from "lucide-react";

import { normalizeProfile } from "../../lib/candidate-profile";
import { scoreTierTextClass } from "../../lib/format";
import { cn } from "../../lib/utils";
import type { CandidateDetail } from "../../types/api";
import { CandidateStatusBadge } from "../StatusBadge";
import { ScoreCard } from "./ScoreCard";

export function CompareCandidateCard({ candidate }: { candidate: CandidateDetail }) {
  const profile = normalizeProfile(candidate.profile, candidate);
  const scores = candidate.scores ?? [];
  const topEdu = profile.education[0] as
    | Record<string, unknown>
    | undefined;
  const topExp = profile.work_experience[0] as
    | Record<string, unknown>
    | undefined;

  return (
    <div
      className="card-hover flex flex-col rounded-lg border border-border bg-background overflow-hidden"
    >
      <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 px-4 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold truncate">
              {profile.name || candidate.original_filename}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {profile.email ? (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[140px]">
                    {profile.email}
                  </span>
                </span>
              ) : null}
              {profile.city ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.city}
                </span>
              ) : null}
            </div>
          </div>
          <CandidateStatusBadge status={candidate.status} />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span
            className={cn("text-3xl font-bold tabular-nums", scoreTierTextClass(candidate.total_score ?? 0))}
          >
            {candidate.total_score ?? "--"}
          </span>
          <span className="mb-1 text-xs text-muted-foreground">
            综合评分
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {profile.skills.length ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              技能
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
              {profile.skills.length > 8 ? (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  +{profile.skills.length - 8}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {topEdu ? (
          <div className="flex items-start gap-2 text-xs">
            <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {String(topEdu.school ?? topEdu.institution ?? "")}
              </p>
              <p className="text-muted-foreground truncate">
                {String(topEdu.degree ?? "")}
                {topEdu.major ? ` · ${String(topEdu.major)}` : ""}
              </p>
            </div>
          </div>
        ) : null}

        {topExp ? (
          <div className="flex items-start gap-2 text-xs">
            <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {String(topExp.company ?? topExp.employer ?? "")}
              </p>
              <p className="text-muted-foreground truncate">
                {String(topExp.title ?? topExp.position ?? "")}
              </p>
            </div>
          </div>
        ) : null}

        {scores.length ? (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">
              岗位匹配 ({scores.length})
            </p>
            <div className="space-y-2">
              {scores.map((score) => (
                <ScoreCard key={score.id} score={score} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
