import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Tag } from "../Tag";

interface CandidateFilterChipsProps {
  total: number;
  pageStart: number;
  pageEnd: number;
  q: string;
  clearKeyword: () => void;
  selectedSkills: string[];
  removeSkillFilter: (nextSkill: string) => void;
  skillSuggestions: string[];
  addSkillFilter: (nextSkill: string) => void;
}

export function CandidateFilterChips({
  total,
  pageStart,
  pageEnd,
  q,
  clearKeyword,
  selectedSkills,
  removeSkillFilter,
  skillSuggestions,
  addSkillFilter,
}: CandidateFilterChipsProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <span className="text-xs font-medium text-muted-foreground">
        {t("当前结果：{{value}} 份", { value: total })}
      </span>
      {total > 0 ? (
        <span className="text-xs text-muted-foreground">
          {t("当前显示 {{start}}-{{end}}", { start: pageStart, end: pageEnd })}
        </span>
      ) : null}
      {q ? (
        <button
          type="button"
          onClick={clearKeyword}
          className="inline-flex max-w-full items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/15"
        >
          <span className="truncate">{t("关键字：{{value}}", { value: q })}</span>
          <X className="h-3 w-3 shrink-0" />
        </button>
      ) : null}
      {selectedSkills.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => removeSkillFilter(item)}
          className="inline-flex max-w-full items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/15"
        >
          <span className="truncate">{t("技能：{{value}}", { value: item })}</span>
          <X className="h-3 w-3 shrink-0" />
        </button>
      ))}
      {skillSuggestions.length ? (
        <>
          <span className="ml-0 text-xs text-muted-foreground sm:ml-2">
            {t("常见技能")}
          </span>
          {skillSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addSkillFilter(item)}
              className="transition hover:-translate-y-0.5"
              aria-label={t("添加技能筛选 {{name}}", { name: item })}
            >
              <Tag>{item}</Tag>
            </button>
          ))}
        </>
      ) : null}
    </div>
  );
}
