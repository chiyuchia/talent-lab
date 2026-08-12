import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { setAppLanguage } from "../i18n";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage?.startsWith("zh") ? "zh" : "en";
  const nextLanguage = currentLanguage === "zh" ? "en" : "zh";
  const label = t(currentLanguage === "zh" ? "切换到英文" : "切换到中文");

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setAppLanguage(nextLanguage)}
      className={cn("h-9 px-2.5", className)}
      aria-label={label}
      title={label}
    >
      <Languages className="h-4 w-4" />
      <span>{nextLanguage === "zh" ? "中文" : "EN"}</span>
    </Button>
  );
}
