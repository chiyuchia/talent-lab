import { Cpu, FolderGit2, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { asRecord, toDisplayText, toStringList } from "./profile-utils";

interface ProfileProjectsTabProps {
  projects: unknown[];
}

export function ProfileProjectsTab({ projects }: ProfileProjectsTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-fadeIn max-h-[300px] overflow-y-auto pr-1">
      {projects.length > 0 ? (
        <div className="space-y-3.5">
          {projects.map((item, index) => {
            const project = asRecord(item);
            const name = toDisplayText(project.name);
            const techStack = toStringList(project.tech_stack);
            const responsibilities = toDisplayText(project.responsibilities);
            const highlights = toDisplayText(project.highlights);

            return (
              <div
                key={index}
                className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-background hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                <div className="flex items-start gap-2">
                  <FolderGit2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <h5 className="font-bold text-foreground text-xs sm:text-sm">{name || t("项目名称")}</h5>
                </div>

                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {techStack.map((tech, tIndex) => (
                      <span key={tIndex} className="text-[9px] font-bold bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 mt-3.5 border-t border-border pt-2.5">
                  {responsibilities ? (
                    <div className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                      <Cpu className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-foreground">{t("项目职责：")}</span>
                        <span className="break-all">{responsibilities}</span>
                      </div>
                    </div>
                  ) : null}

                  {highlights ? (
                    <div className="text-[11px] text-success leading-relaxed flex items-start gap-2 bg-success/10 p-2 rounded-lg border border-success/20">
                      <Trophy className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">{t("项目成果：")}</span>
                        <span className="break-all">{highlights}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center text-muted-foreground gap-2">
          <FolderGit2 className="h-8 w-8 text-muted-foreground/40" />
          <span className="text-xs">{t("暂无项目经历")}</span>
        </div>
      )}
    </div>
  );
}
