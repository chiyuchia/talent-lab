import { useTranslation } from "react-i18next";

import type { JobOpportunity } from "../../types/api";
import { Badge } from "../ui/badge";
import { educationLabel, experienceLabel } from "./job-display";

type Props = { job: JobOpportunity };

function TextList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-medium">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : <p className="mt-3 text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}

export function JobRequirementsOverview({ job }: Props) {
  const { t } = useTranslation();
  const namedRequirements = [
    ...job.language_requirements.map((item) => `${item.language || item.name || t("语言")} - ${item.level}`),
    ...job.certification_requirements.map((item) => `${item.name || t("证书名称")} - ${item.level}`),
  ];
  const constraints = Object.entries(job.constraints)
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}: ${value}`);
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-medium">{t("技能要求")}</h3>
          <span className="text-xs text-muted-foreground">
            {t("{{required}} 项必备, {{preferred}} 项加分", {
              required: job.skill_requirements.filter((item) => item.importance === "required").length,
              preferred: job.skill_requirements.filter((item) => item.importance === "preferred").length,
            })}
          </span>
        </div>
        {job.skill_requirements.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skill_requirements.map((skill, index) => (
              <Badge key={`${skill.name}-${index}`} variant={skill.importance === "required" ? "default" : "outline"}>
                {skill.name}
                {skill.min_years !== null ? ` ${skill.min_years}+ ${t("年")}` : ""}
              </Badge>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-muted-foreground">{t("尚未整理技能要求")}</p>}
      </section>

      <section className="grid gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">{t("经验要求")}</p>
          <p className="mt-1 font-medium">{experienceLabel(job) ? t("{{value}} 年", { value: experienceLabel(job) }) : t("未指定")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("最低学历")}</p>
          <p className="mt-1 font-medium">{educationLabel(job.minimum_education) ? t(educationLabel(job.minimum_education)!) : t("未指定")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("优先专业")}</p>
          <p className="mt-1 font-medium">{job.preferred_majors.join(" / ") || t("未指定")}</p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <TextList title={t("行业或领域经验")} items={job.industry_experience} empty={t("尚未补充行业经验要求")} />
        <TextList title={t("语言、证书与限制")} items={[...namedRequirements, ...constraints]} empty={t("尚未补充其他硬性条件")} />
        <TextList title={t("其他任职要求")} items={job.other_requirements} empty={t("尚未补充其他任职要求")} />
        <TextList title={t("福利")} items={job.benefits} empty={t("尚未补充福利信息")} />
      </div>
    </div>
  );
}
