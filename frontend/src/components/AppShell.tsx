import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Outlet, useMatches, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { authApi } from "../lib/api";
import { useCompareStore } from "../lib/compare-store";
import { useUiStore } from "../lib/ui-store";
import { cn } from "../lib/utils";
import { AppHeader } from "./app-shell/AppHeader";
import { DesktopSidebar } from "./app-shell/DesktopSidebar";
import { MobileSidebar } from "./app-shell/MobileSidebar";
import { resolvePageTitleKey } from "./app-shell/nav";
import { CompareResultPanel } from "./CompareResultPanel";
import { ResizableDrawer } from "./ResizableDrawer";

type AppRouteHandle = {
  fullWidth?: boolean;
};

export function AppShell() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();
  const matches = useMatches();
  const isFullWidth = matches.some((match) =>
    Boolean((match.handle as AppRouteHandle | undefined)?.fullWidth),
  );
  const pageTitle = t(resolvePageTitleKey(
    matches[matches.length - 1]?.pathname ?? "/",
  ));
  const queryClient = useQueryClient();
  const {
    selectedIds,
    drawerOpen,
    compareResult,
    compareError,
    isComparing,
    closeDrawer,
    clearSelected,
  } = useCompareStore();
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      navigate("/login", { replace: true });
    },
  });

  function closeSidebar() {
    setSidebarOpen(false);
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (editing) return;
      if (event.key === "/") {
        event.preventDefault();
        navigate("/resumes");
        window.setTimeout(
          () =>
            document
              .querySelector<HTMLInputElement>('[data-candidate-search]')
              ?.focus(),
          0,
        );
      }
      if (event.key === "u") navigate("/resumes/new");
      if (event.key === "j") navigate("/jobs");
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [navigate]);

  useEffect(() => {
    if (drawerOpen) return;

    const timer = window.setTimeout(clearSelected, 240);
    return () => window.clearTimeout(timer);
  }, [clearSelected, drawerOpen]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <DesktopSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <MobileSidebar open={sidebarOpen} closeSidebar={closeSidebar} />

      <div className={sidebarCollapsed ? "lg:pl-16" : "lg:pl-56"}>
        <AppHeader
          pageTitle={pageTitle}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={() => logoutMutation.mutate()}
        />
        <main
          className={cn("w-full px-4 py-6 lg:px-8", !isFullWidth && "mx-auto max-w-7xl")}
        >
          <Outlet />
        </main>
      </div>

      <ResizableDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={t("简历对比")}
        defaultWidth={Math.min(
          1200,
          Math.max(
            600,
            (compareResult?.candidates.length ?? selectedIds.length) *
              320 +
              ((compareResult?.candidates.length ?? selectedIds.length) -
                1) *
                12 +
              32,
          ),
        )}
      >
        <CompareResultPanel
          candidates={compareResult?.candidates ?? []}
          empty={
            <p className="mt-2 text-xs text-muted-foreground text-center">
              {isComparing
                ? t("对比中...")
                : compareError
                  ? compareError.message
                  : t("选择 2-3 份简历后点击「开始对比」")}
            </p>
          }
        />
      </ResizableDrawer>
    </div>
  );
}
