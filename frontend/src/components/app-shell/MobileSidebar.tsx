import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import { usePresence } from "../../hooks/usePresence";
import { Button } from "../ui/button";
import { navItems } from "./nav";

interface MobileSidebarProps {
  open: boolean;
  closeSidebar: () => void;
}

export function MobileSidebar({ open, closeSidebar }: MobileSidebarProps) {
  const { t } = useTranslation();
  const { rendered, visible } = usePresence(open, 240);
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    sidebarRef.current?.toggleAttribute("inert", !open);
  }, [open, rendered]);

  if (!rendered) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[hsl(var(--scrim)/0.5)] transition-opacity duration-200 lg:hidden",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 border-r border-border bg-background p-4 transition-[transform,opacity] duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:hidden",
          visible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
        )}
        aria-hidden={!open}
        aria-label={t("导航")}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold">Talent Lab</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("智能求职管理平台")}
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
