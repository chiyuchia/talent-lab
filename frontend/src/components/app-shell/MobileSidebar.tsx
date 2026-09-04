import { useEffect, useRef } from "react";
import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { usePresence } from "../../hooks/usePresence";
import { cn } from "../../lib/utils";
import { BrandMark } from "../BrandMark";
import { Button } from "../ui/button";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { navItems } from "./nav";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  theme: string;
  toggleTheme: () => void;
  onLogout: () => void;
}

export function MobileSidebar({
  open,
  onOpenChange,
  triggerRef,
  theme,
  toggleTheme,
  onLogout,
}: MobileSidebarProps) {
  const { t } = useTranslation();
  const { rendered, visible } = usePresence(open, 200);
  const menuRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, triggerRef]);
  useEffect(() => {
    if (open && rendered) {
      const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      firstFocusable?.focus();
    }
  }, [open, rendered]);
  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("main-scroll-container");
    if (!main) return;
    const previousOverflow = main.style.overflow;
    main.style.overflow = "hidden";
    return () => {
      main.style.overflow = previousOverflow;
    };
  }, [open]);
  function handleClose() {
    onOpenChange(false);
    triggerRef.current?.focus();
  }
  return (
    <>
      <Button
        ref={triggerRef}
        id="mobile-nav-trigger"
        variant="outline"
        size="icon"
        onClick={() => onOpenChange(!open)}
        className={cn(
          "fixed left-3 top-3 z-[60] h-11 w-11 rounded-md border-border bg-card text-foreground shadow-[0_6px_18px_hsl(var(--scrim)/0.12)] lg:hidden",
          open && "bg-accent",
        )}
        aria-label={t(open ? "关闭导航" : "打开导航")}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {rendered ? (
        <div className="lg:hidden">
          <div
            className={cn(
              "fixed inset-0 z-40 bg-[hsl(var(--scrim)/0.38)] backdrop-blur-sm transition-opacity duration-200",
              visible ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={handleClose}
            aria-hidden="true"
          />

          <aside
            ref={menuRef}
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-hidden={!visible}
            aria-label={t("移动端导航")}
            className={cn(
              "fixed left-3 top-[68px] z-50 flex max-h-[calc(100dvh-80px)] w-[280px] max-w-[calc(100vw-24px)] select-none flex-col overflow-y-auto rounded-[20px] border border-border bg-card p-4 shadow-[0_18px_50px_hsl(var(--scrim)/0.24)] transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "-translate-y-2 scale-95 opacity-0",
            )}
          >
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <BrandMark />
              <div>
                <p className="font-display text-sm font-semibold leading-tight text-foreground">
                  Talent Lab
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {t("智能求职管理平台")}
                </p>
              </div>
            </div>

            <nav className="my-3 space-y-1" aria-label={t("移动主导航")}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={handleClose}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                    )
                  }
                >
                  <item.icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
              <LanguageSwitcher className="flex-1 justify-center" />
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 shrink-0 text-muted-foreground"
                aria-label={t("切换主题")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  handleClose();
                  onLogout();
                }}
                className="h-9 w-9 shrink-0 text-muted-foreground"
                aria-label={t("退出登录")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
