import type { Dispatch, SetStateAction } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { navItems } from "./nav";

interface DesktopSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function DesktopSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
}: DesktopSidebarProps) {
  const { t } = useTranslation();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 hidden border-r border-border bg-card p-4 lg:block",
        sidebarCollapsed ? "w-16" : "w-56",
      )}
    >
      <div className={cn("mb-8 flex items-center", sidebarCollapsed ? "justify-center" : "justify-between")}>
        {!sidebarCollapsed && (
          <div>
            <p className="text-xl font-semibold">Talent Lab</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("智能求职管理平台")}</p>
          </div>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="h-8 w-8 shrink-0"
          aria-label={t(sidebarCollapsed ? "展开侧边栏" : "收起侧边栏")}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md py-2 text-sm transition-colors duration-200",
                sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
            title={t(item.labelKey)}
          >
            <item.icon aria-hidden className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>{t(item.labelKey)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
