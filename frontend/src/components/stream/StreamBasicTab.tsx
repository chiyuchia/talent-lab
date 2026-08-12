import { User, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FieldValueSkeleton, SkillListSkeleton } from "./ResumeStreamSkeletons";

interface StreamBasicTabProps {
  name: string;
  email: string;
  phone: string;
  city: string;
  skills: string[];
  isCompleted: boolean;
}

export function StreamBasicTab({ name, email, phone, city, skills, isCompleted }: StreamBasicTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-4 p-3.5 bg-muted/40 rounded-lg border border-border/60">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t("候选人姓名")}</p>
          {name ? (
            <p className="text-base font-bold text-foreground mt-0.5">{name}</p>
          ) : (
            <FieldValueSkeleton className="mt-1 h-5 w-24" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{t("电子邮箱")}</span>
          </div>
          {email ? (
            <p className="text-xs font-medium text-foreground mt-1.5 break-all">{email}</p>
          ) : (
            <FieldValueSkeleton className="w-36" />
          )}
        </div>

        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{t("联系电话")}</span>
          </div>
          {phone ? (
            <p className="text-xs font-medium text-foreground mt-1.5">{phone}</p>
          ) : (
            <FieldValueSkeleton />
          )}
        </div>
      </div>

      <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">{t("意向城市")}</span>
        </div>
        {city ? (
            <p className="text-xs font-medium text-foreground mt-1.5">{city}</p>
          ) : isCompleted ? (
            <p className="text-xs text-muted-foreground mt-1.5">{t("未提取到期望城市")}</p>
        ) : (
          <FieldValueSkeleton className="w-16" />
        )}
      </div>

      {/* Skills tags */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t("核心技能清单")}</span>
        </div>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary border border-primary/15"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : isCompleted ? (
          <p className="text-xs text-muted-foreground">{t("未提取到专业技能")}</p>
        ) : (
          <SkillListSkeleton />
        )}
      </div>
    </div>
  );
}
