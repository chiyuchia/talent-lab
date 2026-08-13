import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ScoreResult } from "../../types/api";

type Props = { details: ScoreResult["details"] };

function strings(details: ScoreResult["details"], key: string): string[] {
  const value = details[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item)) : [];
}

export function MatchInsights({ details }: Props) {
  const { t } = useTranslation();
  const groups = [
    { key: "matched_required_skills", title: "已匹配技能", icon: CheckCircle2, tone: "text-success" },
    { key: "missing_required_skills", title: "技能缺口", icon: AlertTriangle, tone: "text-warning" },
    { key: "hard_requirement_risks", title: "硬性条件风险", icon: AlertTriangle, tone: "text-destructive" },
    { key: "resume_suggestions", title: "简历定制建议", icon: Lightbulb, tone: "text-primary" },
    { key: "cover_letter_points", title: "求职信要点", icon: Lightbulb, tone: "text-primary" },
    { key: "interview_questions", title: "面试准备", icon: Lightbulb, tone: "text-primary" },
    { key: "opportunity_highlights", title: "职位亮点", icon: CheckCircle2, tone: "text-success" },
    { key: "opportunity_risks", title: "职位风险", icon: AlertTriangle, tone: "text-warning" },
  ].map((group) => ({ ...group, items: strings(details, group.key) })).filter((group) => group.items.length);
  const keywords = strings(details, "keywords");

  if (!groups.length && !keywords.length) return null;
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      {groups.map(({ key, title, icon: Icon, tone, items }) => (
        <section key={key} className="rounded-md bg-muted/40 p-3">
          <h5 className="flex items-center gap-1.5 text-xs font-medium">
            <Icon className={`h-3.5 w-3.5 ${tone}`} />{t(title)}
          </h5>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground">
            {items.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>
      ))}
      {keywords.length ? (
        <section className="rounded-md bg-muted/40 p-3 md:col-span-2">
          <h5 className="text-xs font-medium">{t("职位描述关键词")}</h5>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {keywords.map((keyword) => <span key={keyword} className="rounded bg-background px-2 py-1 text-xs">{keyword}</span>)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
