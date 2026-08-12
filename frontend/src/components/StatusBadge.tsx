import type { CandidateStatus } from "../types/api";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Badge variant={statusVariant[status]}>
      {t(statusLabels[status])}
    </Badge>
  );
}

export function ParseStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <Badge variant={parseStatusVariant[status] ?? "outline"}>
      {t(parseStatusLabels[status] ?? status)}
    </Badge>
  );
}
