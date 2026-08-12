import { create } from "zustand";

import i18n from "../i18n";

type Theme = "light" | "dark";

export type GlobalErrorNotice = {
  id: string;
  title: string;
  message: string;
  createdAt: number;
};

type UiState = {
  theme: Theme;
  errors: GlobalErrorNotice[];
  loadingCount: number;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  pushError: (error: { title?: string; message: string }) => string;
  dismissError: (id: string) => void;
  clearErrors: () => void;
  startLoading: () => () => void;
};

const storedTheme = localStorage.getItem("talent-lab-theme") as Theme | null;
const initialTheme: Theme =
  storedTheme ??
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

function createErrorId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: initialTheme,
  errors: [],
  loadingCount: 0,
  setTheme: (theme) => {
    localStorage.setItem("talent-lab-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
  toggleTheme: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
  pushError: ({ title = i18n.t("操作失败"), message }) => {
    const id = createErrorId();
    set((state) => ({
      errors: [
        ...state.errors.slice(-3),
        {
          id,
          title,
          message,
          createdAt: Date.now(),
        },
      ],
    }));
    return id;
  },
  dismissError: (id) => {
    set((state) => ({ errors: state.errors.filter((error) => error.id !== id) }));
  },
  clearErrors: () => {
    set({ errors: [] });
  },
  startLoading: () => {
    let active = true;
    set((state) => ({ loadingCount: state.loadingCount + 1 }));

    return () => {
      if (!active) return;
      active = false;
      set((state) => ({ loadingCount: Math.max(0, state.loadingCount - 1) }));
    };
  },
}));

document.documentElement.classList.toggle("dark", initialTheme === "dark");
