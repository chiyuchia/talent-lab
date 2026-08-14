import { useCallback, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { usePresence } from "../hooks/usePresence";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface ResizableDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  children: React.ReactNode;
}

export function ResizableDrawer({
  open,
  onClose,
  title,
  minWidth = 480,
  maxWidth = 1200,
  defaultWidth = 720,
  children,
}: ResizableDrawerProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(defaultWidth);
  const prevOpenRef = useRef(open);
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const { rendered, visible } = usePresence(open, 240);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setWidth(defaultWidth);
    }
    prevOpenRef.current = open;
  }, [open, defaultWidth]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setIsDragging(true);
      startXRef.current = event.clientX;
      startWidthRef.current = width;
    },
    [width],
  );

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(event: MouseEvent) {
      const delta = startXRef.current - event.clientX;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidthRef.current + delta),
      );
      setWidth(newWidth);
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, minWidth, maxWidth]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.hasAttribute("inert"));
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (open && rendered) closeButtonRef.current?.focus();
  }, [open, rendered]);

  useEffect(() => {
    drawerRef.current?.toggleAttribute("inert", !open);
  }, [open, rendered]);

  if (!rendered) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[hsl(var(--scrim)/0.45)] transition-opacity duration-200",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex transition-[transform,opacity] duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
        )}
        style={{ width, maxWidth: "100vw" }}
        aria-hidden={!open}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
      >
        {/* Resize handle */}
        <div
          className="relative z-10 -ml-2 hidden w-4 cursor-col-resize items-center justify-center sm:flex group"
          onMouseDown={handleMouseDown}
          role="separator"
          aria-label={t("调整抽屉宽度")}
        >
          <div className="h-12 w-1 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col bg-background border-l border-border shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 id={titleId} className="text-lg font-semibold">{title}</h3>
            <Button
              ref={closeButtonRef}
              variant="outline"
              size="icon"
              onClick={onClose}
              aria-label={t("关闭")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </aside>
    </>
  );
}
