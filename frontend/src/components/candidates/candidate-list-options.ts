import type { UseMutationResult } from "@tanstack/react-query";
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";

import type { CandidateStatus } from "../../types/api";

export const statusOptions: Array<{ value: "" | CandidateStatus; label: string }> = [
  { value: "", label: "全部状态" },
  { value: "pending", label: "待筛选" },
  { value: "screen_passed", label: "初筛通过" },
  { value: "interviewing", label: "面试中" },
  { value: "hired", label: "已录用" },
  { value: "rejected", label: "已淘汰" },
];

export type SortField = "uploaded_at" | "score";
export type SortDirection = "asc" | "desc";
export type ViewMode = "table" | "card";

export const sortFieldOptions: Array<{ value: SortField; label: string }> = [
  { value: "uploaded_at", label: "上传时间" },
  { value: "score", label: "评分" },
];

export const sortDirectionOptions: Array<{
  value: SortDirection;
  label: string;
  icon: typeof ArrowDownWideNarrow;
}> = [
  { value: "desc", label: "降序", icon: ArrowDownWideNarrow },
  { value: "asc", label: "升序", icon: ArrowUpWideNarrow },
];

export const pageSizeOptionsByView: Record<ViewMode, number[]> = {
  table: [10, 20, 50, 100],
  card: [9, 24, 48, 96],
};

export const defaultPageSizeByView: Record<ViewMode, number> = {
  table: 20,
  card: 24,
};

export type DeleteCandidateMutation = UseMutationResult<
  { id: number; deleted: boolean },
  Error,
  number,
  unknown
>;

export function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const windowSize = 5;
  const start = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - windowSize + 1),
  );
  const end = Math.min(totalPages, start + windowSize - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function normalizeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  return skills
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
