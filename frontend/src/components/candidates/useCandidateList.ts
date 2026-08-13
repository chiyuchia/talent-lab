import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { candidateApi } from "../../lib/api";
import type { CandidateStatus } from "../../types/api";
import {
  getVisiblePages,
  normalizeSkills,
  pageSizeOptionsByView,
} from "./candidate-list-options";
import type { SortDirection, SortField, ViewMode } from "./candidate-list-options";
import {
  loadCandidateListPreferences,
  saveCandidateListPreferences,
} from "./candidate-list-preferences";

export function useCandidateList() {
  const [initialPreferences] = useState(loadCandidateListPreferences);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | CandidateStatus>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("uploaded_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>(initialPreferences.view);
  const [pageSizeByView, setPageSizeByView] = useState<
    Record<ViewMode, number>
  >(initialPreferences.pageSizeByView);
  const queryClient = useQueryClient();
  const pageSize = pageSizeByView[view];
  const pageSizeOptions = pageSizeOptionsByView[view];
  const sort = `${sortDirection === "desc" ? "-" : ""}${sortField}`;
  const candidatesQuery = useQuery({
    queryKey: [
      "candidates",
      { q, status, skills: selectedSkills, sort, page, pageSize },
    ],
    queryFn: () =>
      candidateApi.list({
        q,
        status,
        skill: selectedSkills,
        sort,
        page,
        page_size: pageSize,
      }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: candidateApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  const candidates = useMemo(
    () => candidatesQuery.data?.items ?? [],
    [candidatesQuery.data?.items],
  );
  const total = candidatesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = total ? (page - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, totalPages);
  const selectedSkillKeys = useMemo(
    () => new Set(selectedSkills.map((item) => item.toLowerCase())),
    [selectedSkills],
  );
  const skillSuggestions = useMemo(() => {
    const counts = new Map<string, number>();
    candidates.forEach((candidate) => {
      candidate.skills.forEach((item) => {
        const normalized = item.trim();
        if (!normalized || selectedSkillKeys.has(normalized.toLowerCase()))
          return;
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([item]) => item);
  }, [candidates, selectedSkillKeys]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    saveCandidateListPreferences({ view, pageSizeByView });
  }, [view, pageSizeByView]);

  function resetToFirstPage() {
    setPage(1);
  }

  function clearKeyword() {
    setQ("");
    resetToFirstPage();
  }

  function handleViewChange(nextView: ViewMode) {
    if (nextView === view) return;
    setView(nextView);
    resetToFirstPage();
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSizeByView((current) => ({
      ...current,
      [view]: nextPageSize,
    }));
    resetToFirstPage();
  }

  function updateSkillFilters(nextSkills: string[]) {
    setSelectedSkills(normalizeSkills(nextSkills));
    resetToFirstPage();
  }

  function addSkillFilter(nextSkill: string) {
    updateSkillFilters([...selectedSkills, nextSkill]);
  }

  function removeSkillFilter(nextSkill: string) {
    updateSkillFilters(
      selectedSkills.filter(
        (item) => item.toLowerCase() !== nextSkill.toLowerCase(),
      ),
    );
  }

  function clearSkills() {
    setSelectedSkills([]);
    resetToFirstPage();
  }

  return {
    q,
    setQ,
    status,
    setStatus,
    selectedSkills,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    page,
    setPage,
    view,
    pageSize,
    pageSizeOptions,
    candidatesQuery,
    deleteMutation,
    candidates,
    total,
    totalPages,
    pageStart,
    pageEnd,
    visiblePages,
    skillSuggestions,
    resetToFirstPage,
    clearKeyword,
    handleViewChange,
    handlePageSizeChange,
    updateSkillFilters,
    addSkillFilter,
    removeSkillFilter,
    clearSkills,
  };
}
