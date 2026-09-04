import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { authApi } from "../lib/api";
import { useCompareStore } from "../lib/compare-store";
import { useUiStore } from "../lib/ui-store";
import { cn } from "../lib/utils";
import { DesktopSidebar } from "./app-shell/DesktopSidebar";
import { MobileSidebar } from "./app-shell/MobileSidebar";
import { CompareResultPanel } from "./CompareResultPanel";
import { ResizableDrawer } from "./ResizableDrawer";

type AppRouteHandle = {
  fullWidth?: boolean;
};

export function AppShell() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const { theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const isFullWidth = matches.some((match) =>
    Boolean((match.handle as AppRouteHandle | undefined)?.fullWidth),
  );
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

  // Reset scroll position on route change
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

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
    <div className="h-dvh w-full overflow-hidden bg-muted text-foreground lg:p-4">
      <div className="app-shell relative flex h-full w-full overflow-hidden bg-background lg:rounded-shell lg:border lg:border-border">
        <DesktopSidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={() => logoutMutation.mutate()}
        />

        <MobileSidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          triggerRef={mobileTriggerRef}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={() => logoutMutation.mutate()}
        />

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <main
            ref={mainScrollRef}
            id="main-scroll-container"
            data-app-scroll-container
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8 pt-20 sm:px-6 lg:px-10 lg:py-10 xl:px-12"
          >
            <div className={cn("w-full", !isFullWidth && "mx-auto max-w-7xl")}>
              <Outlet />
            </div>
          </main>
        </div>
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
            <p className="mt-2 text-center text-xs text-muted-foreground">
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
