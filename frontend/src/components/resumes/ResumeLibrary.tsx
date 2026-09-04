import { FilePlus2, GitCompare, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCompareStore } from "../../lib/compare-store";
import { cn } from "../../lib/utils";
import { CandidateCardGrid } from "../candidates/CandidateCardGrid";
import { CandidateFilterChips } from "../candidates/CandidateFilterChips";
import { CandidateFilterPanel } from "../candidates/CandidateFilterPanel";
import { CandidatePagination } from "../candidates/CandidatePagination";
import { CandidateTable } from "../candidates/CandidateTable";
import { useCandidateList } from "../candidates/useCandidateList";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ResumeLibraryProps {
  onUpload: () => void;
}

export function ResumeLibrary({ onUpload }: ResumeLibraryProps) {
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
    <section className="space-y-6" aria-label={t("简历库")}>
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="mb-5 flex justify-end">
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
              <Button variant="ghost" size="icon" onClick={clearKeyword} className="absolute right-2 top-2 h-6 w-6 rounded text-muted-foreground" aria-label={t("清空关键字搜索")}>
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
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
      {candidatesQuery.isLoading ? <div className="h-48 rounded-lg bg-muted skeleton-shimmer" /> : null}
      {candidatesQuery.isError ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          <span>{t("简历加载失败，请稍后重试。")}</span>
          <Button variant="outline" size="sm" onClick={() => void candidatesQuery.refetch()}>{t("重试")}</Button>
        </div>
      ) : null}
      {!candidatesQuery.isLoading && !candidatesQuery.isError && candidates.length === 0 ? (
        <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-border bg-card p-6 text-center animate-fade-in">
          <div>
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FilePlus2 className="h-4 w-4" />
            </span>
            <p className="mt-4 font-medium">{t("暂无简历")}</p>
            <Button className="mt-4" size="sm" onClick={onUpload}>
              {t("添加简历")}
            </Button>
          </div>
        </div>
      ) : null}
      {!candidatesQuery.isError && view === "table" && candidates.length > 0 ? (
        <CandidateTable candidates={candidates} selectedIds={selectedIds} selectMany={selectMany} deselectMany={deselectMany} toggleCandidate={toggleCandidate} deleteMutation={deleteMutation} />
      ) : null}
      {!candidatesQuery.isError && view === "card" && candidates.length > 0 ? (
        <CandidateCardGrid candidates={candidates} selectedIds={selectedIds} toggleCandidate={toggleCandidate} deleteMutation={deleteMutation} />
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
        <div className="view-transition-enter sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-lg border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t("已选 {{value}} 份", { value: selectedIds.length })}</span>
            <button type="button" onClick={clearSelected} className="text-xs text-muted-foreground transition-colors hover:text-foreground">{t("清空")}</button>
          </div>
          <Button onClick={() => runCompare()} disabled={selectedIds.length < 2 || isComparing}>
            <GitCompare className="h-4 w-4" />
            {t(isComparing ? "对比中..." : "开始对比")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
