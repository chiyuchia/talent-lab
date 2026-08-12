import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "../ui/badge";
import { asRecord, getDegreeBadgeVariant, toDisplayText } from "./profile-utils";

interface ProfileEducationTabProps {
  education: unknown[];
}

export function ProfileEducationTab({ education }: ProfileEducationTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-fadeIn max-h-[300px] overflow-y-auto pr-1">
      {education.length > 0 ? (
        <div className="relative border-l-2 border-dashed border-primary/30 ml-3 pl-6 space-y-5">
          {education.map((item, index) => {
            const edu = asRecord(item);
            const school = toDisplayText(edu.school);
            const graduationTime = toDisplayText(edu.graduation_time);
            const major = toDisplayText(edu.major);
            const degree = toDisplayText(edu.degree);

            return (
              <div key={index} className="relative group">
                <div className="absolute -left-[32px] top-1 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm group-hover:scale-110 transition-transform animate-fadeIn" />
                <div className="p-3.5 bg-muted/50 rounded-lg border border-border hover:bg-background hover:shadow-sm transition-all duration-300">
                  <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <h5 className="font-bold text-foreground text-xs sm:text-sm">{school || t("学校名称")}</h5>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide bg-muted px-2 py-0.5 rounded shrink-0">{graduationTime || t("毕业时间")}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground mt-2 font-semibold flex-wrap">
                    <span className="px-2 py-0.5 rounded border border-border bg-background">{t("专业")}: <strong className="text-foreground font-bold">{major || t("未设定")}</strong></span>
                    <Badge variant={getDegreeBadgeVariant(degree)} className="rounded px-2 py-0.5">{t("学位")}: <strong className="font-bold">{degree || t("未设定")}</strong></Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center text-muted-foreground gap-2">
          <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
          <span className="text-xs">{t("暂无教育经历")}</span>
        </div>
      )}
    </div>
  );
}
