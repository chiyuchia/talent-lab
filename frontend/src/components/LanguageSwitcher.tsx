import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { setAppLanguage } from "../i18n";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface LanguageSwitcherProps {
  className?: string;
  iconOnly?: boolean;
}

export function LanguageSwitcher({
  className,
  iconOnly = false,
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage?.startsWith("zh") ? "zh" : "en";
  const nextLanguage = currentLanguage === "zh" ? "en" : "zh";
  const label = t(currentLanguage === "zh" ? "切换到英文" : "切换到中文");

  return (
    <Button
      variant="outline"
      size={iconOnly ? "icon" : "sm"}
      onClick={() => setAppLanguage(nextLanguage)}
      className={cn(iconOnly ? "h-9 w-9 shrink-0" : "h-9 px-2.5", className)}
      aria-label={label}
      title={label}
    >
      <Languages className="h-4 w-4" />
      {!iconOnly && <span>{nextLanguage === "zh" ? "中文" : "EN"}</span>}
    </Button>
  );
}
