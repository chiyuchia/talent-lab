import { Briefcase } from "lucide-react";

import type { WorkExperienceItem } from "../../lib/resume-stream";
import { TimelineSkeleton } from "./ResumeStreamSkeletons";

interface StreamExperienceTabProps {
  workExperience: WorkExperienceItem[];
  isCompleted: boolean;
}

// Resilient worker summary lists generator
const renderWorkSummary = (summary?: string) => {
  if (!summary) return null;
  const bullets = summary
    .split(/[;；\n•*]/g)
    .map((s) => s.trim().replace(/^-\s*/, ""))
    .filter((s) => s.length > 2);

  if (bullets.length === 0) {
    return <p className="text-[11px] text-muted-foreground leading-normal whitespace-pre-wrap">{summary}</p>;
  }

  return (
    <ul className="space-y-2 mt-3 border-t border-border pt-2.5">
      {bullets.map((bullet, bIdx) => (
        <li key={bIdx} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed group/item hover:text-foreground transition-colors">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70 group-hover/item:scale-125 transition-transform" />
          <span className="flex-1">{bullet}</span>
        </li>
      ))}
    </ul>
  );
};

export function StreamExperienceTab({ workExperience, isCompleted }: StreamExperienceTabProps) {
  return (
    <div className="space-y-4 animate-fadeIn max-h-[310px] overflow-y-auto pr-1">
      {workExperience.length > 0 ? (
        <div className="relative border-l-2 border-dashed border-primary/25 ml-3 pl-6 space-y-5">
          {workExperience.map((work, index) => (
            <div key={index} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[32px] top-1.5 h-4 w-4 rounded-full border-2 border-card bg-primary shadow-sm group-hover:scale-110 transition-transform animate-fadeIn" />
              <div className="p-3.5 bg-muted/40 rounded-lg border border-border/60 hover:bg-card transition-colors duration-300">
                <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <h5 className="font-bold text-foreground text-xs sm:text-sm">{work.company || "公司名称"}</h5>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide bg-muted px-2 py-0.5 rounded shrink-0">{work.period || "在职时间"}</span>
                </div>
                <p className="text-xs font-bold text-primary mt-1.5 bg-primary/5 inline-block px-2 py-0.5 rounded border border-primary/10">{work.title || "岗位职称"}</p>
                {renderWorkSummary(work.summary)}
              </div>
            </div>
          ))}
        </div>
      ) : isCompleted ? (
        <div className="flex h-40 flex-col items-center justify-center text-muted-foreground gap-2">
          <Briefcase className="h-8 w-8 text-muted-foreground/40" />
          <span className="text-xs">未提取到工作经历信息</span>
        </div>
      ) : (
        <TimelineSkeleton variant="experience" />
      )}
    </div>
  );
}
