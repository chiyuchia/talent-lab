import { GitCompare, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AnimatedPage } from "../components/AnimatedPage";
import { CandidateCardGrid } from "../components/candidates/CandidateCardGrid";
import { CandidateFilterChips } from "../components/candidates/CandidateFilterChips";
import { CandidateFilterPanel } from "../components/candidates/CandidateFilterPanel";
import { CandidatePagination } from "../components/candidates/CandidatePagination";
import { CandidateTable } from "../components/candidates/CandidateTable";
import { useCandidateList } from "../components/candidates/useCandidateList";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useCompareStore } from "../lib/compare-store";
import { cn } from "../lib/utils";

export function CandidatesPage() {
  const { t } = useTranslation();
  const {
    selectedIds,
    toggleCandidate,
    selectMany,
    deselectMany,
    clearSelected,
    runCompare,
    isComparing,
  } = useCompareStore();
  const {
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
    skillSuggestions,
    resetToFirstPage,
    clearKeyword,
    handleViewChange,
    handlePageSizeChange,
    updateSkillFilters,
    addSkillFilter,
    removeSkillFilter,
    clearSkills,
  } = useCandidateList();

  return (
    <AnimatedPage>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in-down">
          <div>
            <h2 className="text-2xl font-semibold">{t("候选人")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("搜索、筛选与状态管理")}
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                resetToFirstPage();
              }}
              className={cn("pl-9", q ? "pr-9" : "pr-3")}
              placeholder={t("搜索姓名、技能、学校等")}
              aria-label={t("关键字搜索")}
              data-candidate-search
            />
            {q ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearKeyword}
                className="absolute right-2 top-2 h-6 w-6 rounded text-muted-foreground"
                aria-label={t("清空关键字搜索")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 animate-fade-in-up animation-delay-50">
          <CandidateFilterPanel
            status={status}
            setStatus={setStatus}
            resetToFirstPage={resetToFirstPage}
            selectedSkills={selectedSkills}
            updateSkillFilters={updateSkillFilters}
            clearSkills={clearSkills}
            sortField={sortField}
            setSortField={setSortField}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            view={view}
            handleViewChange={handleViewChange}
          />
          <CandidateFilterChips
            total={total}
            pageStart={pageStart}
            pageEnd={pageEnd}
            q={q}
            clearKeyword={clearKeyword}
            selectedSkills={selectedSkills}
            removeSkillFilter={removeSkillFilter}
            skillSuggestions={skillSuggestions}
            addSkillFilter={addSkillFilter}
          />
        </div>
        {candidatesQuery.isLoading ? (
          <div className="h-48 rounded-lg bg-muted skeleton-shimmer" />
        ) : null}
        {!candidatesQuery.isLoading && candidates.length === 0 ? (
          <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground animate-fade-in">
            <Link
              className="hover:text-foreground transition-colors"
              to="/upload"
            >
              {t("暂无候选人，前往上传")}
            </Link>
          </div>
        ) : null}
        {view === "table" && candidates.length > 0 ? (
          <CandidateTable
            candidates={candidates}
            selectedIds={selectedIds}
            selectMany={selectMany}
            deselectMany={deselectMany}
            toggleCandidate={toggleCandidate}
            deleteMutation={deleteMutation}
          />
        ) : null}
        {view === "card" && candidates.length > 0 ? (
          <CandidateCardGrid
            candidates={candidates}
            selectedIds={selectedIds}
            toggleCandidate={toggleCandidate}
            deleteMutation={deleteMutation}
          />
        ) : null}
        {total > 0 ? (
          <CandidatePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            isFetching={candidatesQuery.isFetching}
            setPage={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        ) : null}

        {selectedIds.length > 0 ? (
          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-lg border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur animate-fade-in-up">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {t("已选 {{value}} 人", { value: selectedIds.length })}
              </span>
              <button
                type="button"
                onClick={clearSelected}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("清空")}
              </button>
            </div>
            <Button
              onClick={() => runCompare()}
              disabled={selectedIds.length < 2 || isComparing}
            >
              <GitCompare className="h-4 w-4" />
              {t(isComparing ? "对比中..." : "开始对比")}
            </Button>
          </div>
        ) : null}
      </section>
    </AnimatedPage>
  );
}
