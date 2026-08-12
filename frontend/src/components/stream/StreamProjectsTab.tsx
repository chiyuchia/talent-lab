import { Cpu, FolderGit2, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ProjectItem } from "../../lib/resume-stream";
import { ProjectSkeleton } from "./ResumeStreamSkeletons";

interface StreamProjectsTabProps {
  projects: ProjectItem[];
  isCompleted: boolean;
}

export function StreamProjectsTab({ projects, isCompleted }: StreamProjectsTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-fadeIn max-h-[310px] overflow-y-auto pr-1">
      {projects.length > 0 ? (
        <div className="space-y-3.5">
          {projects.map((proj, index) => (
            <div
              key={index}
              className="p-4 bg-muted/40 rounded-lg border border-border/60 hover:bg-card transition-colors duration-300 relative overflow-hidden group"
            >
              <div className="flex items-start gap-2">
                <FolderGit2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <h5 className="font-bold text-foreground text-xs sm:text-sm">{proj.name || t("项目名称")}</h5>
              </div>

              {/* Tech stack tags */}
              {Array.isArray(proj.tech_stack) && proj.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {proj.tech_stack.map((tech: string, tIndex: number) => (
                    <span key={tIndex} className="text-[9px] font-bold bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2 mt-3.5 border-t border-border pt-2.5">
                {proj.responsibilities && (
                  <div className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-foreground">{t("项目职责：")}</span>
                      <span className="break-all">{proj.responsibilities}</span>
                    </div>
                  </div>
                )}

                {proj.highlights && (
                  <div className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2 bg-primary/5 p-2 rounded-lg border border-primary/10">
                    <Trophy className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-primary">{t("项目成果：")}</span>
                      <span className="break-all">{proj.highlights}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : isCompleted ? (
        <div className="flex h-40 flex-col items-center justify-center text-muted-foreground gap-2">
          <FolderGit2 className="h-8 w-8 text-muted-foreground/40" />
          <span className="text-xs">{t("未提取到项目经历信息")}</span>
        </div>
      ) : (
        <ProjectSkeleton />
      )}
    </div>
  );
}
