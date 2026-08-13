import {
  defaultPageSizeByView,
  pageSizeOptionsByView,
} from "./candidate-list-options";
import type { ViewMode } from "./candidate-list-options";

const STORAGE_KEY = "talent-lab-candidate-list-preferences";

export type CandidateListPreferences = {
  view: ViewMode;
  pageSizeByView: Record<ViewMode, number>;
};

const defaultPreferences: CandidateListPreferences = {
  view: "table",
  pageSizeByView: { ...defaultPageSizeByView },
};

function isViewMode(value: unknown): value is ViewMode {
  return value === "table" || value === "card";
}

function getPageSize(view: ViewMode, value: unknown): number {
  return typeof value === "number" && pageSizeOptionsByView[view].includes(value)
    ? value
    : defaultPageSizeByView[view];
}

export function loadCandidateListPreferences(): CandidateListPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultPreferences;

    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== "object") return defaultPreferences;

    const preferences = value as Partial<CandidateListPreferences>;
    const pageSizes = preferences.pageSizeByView;
    return {
      view: isViewMode(preferences.view) ? preferences.view : "table",
      pageSizeByView: {
        table: getPageSize("table", pageSizes?.table),
        card: getPageSize("card", pageSizes?.card),
      },
    };
  } catch {
    return defaultPreferences;
  }
}

export function saveCandidateListPreferences(
  preferences: CandidateListPreferences,
) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Browser storage can be unavailable in private or restricted contexts.
  }
}
