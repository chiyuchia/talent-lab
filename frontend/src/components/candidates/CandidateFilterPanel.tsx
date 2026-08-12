import {
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { TagInput } from "../TagInput";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { CandidateStatus } from "../../types/api";
import {
  sortDirectionOptions,
  sortFieldOptions,
  statusOptions,
} from "./candidate-list-options";
import type { SortDirection, SortField, ViewMode } from "./candidate-list-options";

interface CandidateFilterPanelProps {
  status: "" | CandidateStatus;
  setStatus: (value: "" | CandidateStatus) => void;
  resetToFirstPage: () => void;
  selectedSkills: string[];
  updateSkillFilters: (nextSkills: string[]) => void;
  clearSkills: () => void;
  sortField: SortField;
  setSortField: (value: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (value: SortDirection) => void;
  view: ViewMode;
  handleViewChange: (nextView: ViewMode) => void;
}

export function CandidateFilterPanel({
  status,
  setStatus,
  resetToFirstPage,
  selectedSkills,
  updateSkillFilters,
  clearSkills,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  view,
  handleViewChange,
}: CandidateFilterPanelProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(14rem,18rem)_minmax(18rem,1fr)]">
        <label className="block text-sm">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" /> 候选状态
          </span>
          <span className="relative block">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "" | CandidateStatus);
                resetToFirstPage();
              }}
              className="h-10 w-full appearance-none rounded-md border border-border bg-background py-0 pl-3 pr-9 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </span>
        </label>

        <div className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            技能标签筛选
          </span>
          <div className="flex min-w-0 gap-2">
            <TagInput
              value={selectedSkills}
              onChange={updateSkillFilters}
              placeholder="输入技能后按 Enter"
              inputLabel="技能标签筛选"
              className="min-w-0 flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={clearSkills}
              className="h-10 w-10 shrink-0 text-muted-foreground"
              disabled={!selectedSkills.length}
              aria-label="清空技能筛选"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 xl:justify-end">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
            排序字段
          </p>
          <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
            {sortFieldOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSortField(option.value);
                  resetToFirstPage();
                }}
                className={cn(
                  "h-10 px-3 text-sm font-medium transition-colors",
                  sortField === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
            排序方式
          </p>
          <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
            {sortDirectionOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSortDirection(option.value);
                    resetToFirstPage();
                  }}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 px-3 text-sm font-medium transition-colors",
                    sortDirection === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
            视图
          </p>
          <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
            <button
              type="button"
              onClick={() => handleViewChange("table")}
              className={cn(
                "h-10 px-3 transition-colors duration-200",
                view === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              aria-label="表格视图"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("card")}
              className={cn(
                "h-10 px-3 transition-colors duration-200",
                view === "card"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              aria-label="卡片视图"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
