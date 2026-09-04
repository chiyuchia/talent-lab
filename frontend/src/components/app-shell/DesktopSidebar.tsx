import type { Dispatch, SetStateAction } from "react";
import { ChevronsLeft, ChevronsRight, LogOut, Moon, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import { BrandMark } from "../BrandMark";
import { Button } from "../ui/button";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { navItems } from "./nav";

interface DesktopSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  theme: string;
  toggleTheme: () => void;
  onLogout: () => void;
}

export function DesktopSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  theme,
  toggleTheme,
  onLogout,
}: DesktopSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        "relative hidden h-full shrink-0 select-none flex-col border-r border-border bg-card transition-[width] duration-200 ease-out lg:flex",
        sidebarCollapsed ? "w-[72px]" : "w-[224px]",
      )}
      aria-label={t("桌面端导航")}
    >
      <div
        className={cn(
          "flex h-20 shrink-0 items-center overflow-hidden px-4",
          sidebarCollapsed && "justify-center px-2",
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <BrandMark />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold leading-tight tracking-tight text-foreground">
                Talent Lab
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {t("智能求职管理平台")}
              </p>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-[26px] z-20 h-7 w-7 rounded-full border-border bg-card text-muted-foreground shadow-[0_3px_10px_hsl(var(--scrim)/0.12)] hover:bg-accent hover:text-foreground"
        aria-label={t(sidebarCollapsed ? "展开侧边栏" : "收起侧边栏")}
        title={t(sidebarCollapsed ? "展开侧边栏" : "收起侧边栏")}
      >
        {sidebarCollapsed ? (
          <ChevronsRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronsLeft className="h-3.5 w-3.5" />
        )}
      </Button>

      <nav
        className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-2"
        aria-label={t("主导航")}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            aria-label={sidebarCollapsed ? t(item.labelKey) : undefined}
            title={sidebarCollapsed ? t(item.labelKey) : undefined}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center rounded-md text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                sidebarCollapsed ? "justify-center" : "gap-3 px-3",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
              )
            }
          >
            <item.icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      <div
        className={cn(
          "border-t border-border p-3",
          sidebarCollapsed
            ? "flex flex-col items-center gap-2 px-2 py-3"
            : "flex items-center justify-between gap-1.5",
        )}
      >
        <LanguageSwitcher
          iconOnly={sidebarCollapsed}
          className={sidebarCollapsed ? "h-9 w-9" : undefined}
        />

        <div className={cn("flex items-center gap-1.5", sidebarCollapsed && "flex-col")}>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 shrink-0 text-muted-foreground"
            aria-label={t("切换主题")}
            title={sidebarCollapsed ? t("切换主题") : undefined}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onLogout}
            className="h-9 w-9 shrink-0 text-muted-foreground"
            aria-label={t("退出登录")}
            title={sidebarCollapsed ? t("退出登录") : undefined}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
