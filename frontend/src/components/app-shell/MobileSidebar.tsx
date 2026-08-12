import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { navItems } from "./nav";

interface MobileSidebarProps {
  closeSidebar: () => void;
}

export function MobileSidebar({ closeSidebar }: MobileSidebarProps) {
  const { t } = useTranslation();
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[hsl(var(--scrim)/0.5)] lg:hidden"
        onClick={closeSidebar}
      />
      <aside className="fixed inset-y-0 left-0 z-50 w-56 border-r border-border bg-background p-4 lg:hidden animate-fade-in-left">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold">talent-lab</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("智能简历分析平台")}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={closeSidebar}
            aria-label={t("关闭导航")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
                <item.icon aria-hidden className="h-4 w-4" />
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </aside>
      </>
  );
}
