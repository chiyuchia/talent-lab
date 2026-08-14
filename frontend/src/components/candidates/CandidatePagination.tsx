import type { Dispatch, SetStateAction } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Select } from "../ui/select";
import { cn } from "../../lib/utils";
import { getVisiblePages } from "./candidate-list-options";

interface CandidatePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  pageSizeOptions: number[];
  isFetching: boolean;
  setPage: Dispatch<SetStateAction<number>>;
  onPageSizeChange: (nextPageSize: number) => void;
}

export function CandidatePagination({
  page,
  totalPages,
  total,
  pageSize,
  pageSizeOptions,
  isFetching,
  setPage,
  onPageSizeChange,
}: CandidatePaginationProps) {
  const { t } = useTranslation();
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        <span>
          {t("第 {{page}} / {{total}} 页", { page, total: totalPages })}
        </span>
        <span>{t("共 {{value}} 份", { value: total })}</span>
        {isFetching ? (
          <span className="text-primary">{t("更新中...")}</span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-muted-foreground">
          <span>{t("每页")}</span>
          <Select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value));
            }}
            controlSize="sm"
            containerClassName="w-[4.5rem]"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>

        <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={page === 1 || isFetching}
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("第一页")}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || isFetching}
            className="inline-flex h-9 w-9 items-center justify-center border-l border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("上一页")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {visiblePages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPage(item)}
              disabled={isFetching}
              className={cn(
                "h-9 min-w-9 border-l border-border px-3 text-sm font-medium transition",
                page === item
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
              )}
              aria-label={t("第 {{value}} 页", { value: item })}
              aria-current={page === item ? "page" : undefined}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages || isFetching}
            className="inline-flex h-9 w-9 items-center justify-center border-l border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("下一页")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages || isFetching}
            className="inline-flex h-9 w-9 items-center justify-center border-l border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("最后一页")}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
