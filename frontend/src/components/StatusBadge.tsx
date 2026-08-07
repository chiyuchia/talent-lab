import type { CandidateStatus } from "../types/api";
import { parseStatusLabels, statusLabels } from "../lib/format";
import { Badge, type BadgeVariant } from "./ui/badge";

const statusVariant: Record<CandidateStatus, BadgeVariant> = {
  pending: "outline",
  screen_passed: "default",
  interviewing: "warning",
  hired: "success",
  rejected: "destructive",
};

const parseStatusVariant: Record<string, BadgeVariant> = {
  uploaded: "outline",
  parsing: "default",
  extracting: "default",
  completed: "success",
  failed: "destructive",
};

export function CandidateStatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {statusLabels[status]}
    </Badge>
  );
}

export function ParseStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={parseStatusVariant[status] ?? "outline"}>
      {parseStatusLabels[status] ?? status}
    </Badge>
  );
}
