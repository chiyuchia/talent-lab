import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { EducationItem } from "../../lib/resume-stream";
import { TimelineSkeleton } from "./ResumeStreamSkeletons";

interface StreamEducationTabProps {
  education: EducationItem[];
  isCompleted: boolean;
}

export function StreamEducationTab({ education, isCompleted }: StreamEducationTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-fadeIn max-h-[310px] overflow-y-auto pr-1">
      {education.length > 0 ? (
        <div className="relative border-l-2 border-dashed border-primary/25 ml-3 pl-6 space-y-5">
          {education.map((edu, index) => (
            <div key={index} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[32px] top-1 h-4 w-4 rounded-full border-2 border-card bg-primary shadow-sm transition-transform group-hover:scale-110" />
              <div className="p-3.5 bg-muted/40 rounded-lg border border-border/60 hover:bg-card transition-colors duration-300">
                <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <h5 className="font-bold text-foreground text-xs sm:text-sm">{edu.school || t("学校名称")}</h5>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide bg-muted px-2 py-0.5 rounded shrink-0">{edu.graduation_time || t("毕业时间")}</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-2 font-semibold flex-wrap">
                  <span className="px-2 py-0.5 rounded border border-border bg-card">{t("专业")}: <strong className="text-foreground font-bold">{edu.major || t("未设定")}</strong></span>
                  <span className="px-2 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary">{t("学位")}: <strong className="font-bold">{edu.degree || t("未设定")}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isCompleted ? (
        <div className="flex h-40 flex-col items-center justify-center text-muted-foreground gap-2">
          <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
          <span className="text-xs">{t("未提取到教育经历信息")}</span>
        </div>
      ) : (
        <TimelineSkeleton variant="education" />
      )}
    </div>
  );
}
