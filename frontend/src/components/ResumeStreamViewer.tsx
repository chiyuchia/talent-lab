import { useEffect, useRef, useState } from "react";
import { User, CheckCircle, GraduationCap, Briefcase, FolderGit2, Cpu } from "lucide-react";

import { parsePartialJson } from "../lib/resume-stream";
import { TerminalSkeleton } from "./stream/ResumeStreamSkeletons";
import { StreamBasicTab } from "./stream/StreamBasicTab";
import { StreamEducationTab } from "./stream/StreamEducationTab";
import { StreamExperienceTab } from "./stream/StreamExperienceTab";
import { StreamProjectsTab } from "./stream/StreamProjectsTab";

interface ResumeStreamViewerProps {
  streamText: string;
  isCompleted: boolean;
}

export function ResumeStreamViewer({ streamText, isCompleted }: ResumeStreamViewerProps) {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"basic" | "education" | "experience" | "projects">("basic");
  const hasStreamText = streamText.trim().length > 0;
  const isInitialLoading = !isCompleted && !hasStreamText;

  // Parse structured data dynamically from the streaming text
  const data = parsePartialJson(streamText);

  const name = data.name || "";
  const email = data.email || "";
  const phone = data.phone || "";
  const city = data.city || "";
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const workExperience = Array.isArray(data.work_experience) ? data.work_experience : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];

  // Automatically scroll terminal to bottom on new stream content
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamText]);

  return (
    <div
      className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/40 transition-colors duration-300"
      aria-busy={!isCompleted}
    >
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between bg-muted/70 px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors select-none"
      >
        <span className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary animate-pulse" />
          <span>AI 简历实时分析与结构化看板 (SSE)</span>
        </span>
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-success font-semibold">
              <CheckCircle className="h-3.5 w-3.5" /> 解析完成
            </span>
          ) : isInitialLoading ? (
            <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              准备解析
            </span>
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          <span className="text-muted-foreground">{expanded ? "收起" : "展开"}</span>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-card/60 border-t border-border">

          {/* Left Panel: Structured Resume Dashboard (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-lg border border-border bg-card p-4 min-h-[300px]">
            {/* Dashboard Navigation Tabs */}
            <div className="flex border-b border-border pb-2 mb-4 overflow-x-auto gap-2">
              <button
                onClick={() => setActiveTab("basic")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  activeTab === "basic"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <User className="h-3.5 w-3.5" /> 基本信息
              </button>
              <button
                onClick={() => setActiveTab("education")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  activeTab === "education"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" /> 教育经历 ({education.length})
              </button>
              <button
                onClick={() => setActiveTab("experience")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  activeTab === "experience"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" /> 工作经历 ({workExperience.length})
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  activeTab === "projects"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <FolderGit2 className="h-3.5 w-3.5" /> 项目经验 ({projects.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1">
              {activeTab === "basic" && (
                <StreamBasicTab
                  name={name}
                  email={email}
                  phone={phone}
                  city={city}
                  skills={skills}
                  isCompleted={isCompleted}
                />
              )}
              {activeTab === "education" && (
                <StreamEducationTab education={education} isCompleted={isCompleted} />
              )}
              {activeTab === "experience" && (
                <StreamExperienceTab workExperience={workExperience} isCompleted={isCompleted} />
              )}
              {activeTab === "projects" && (
                <StreamProjectsTab projects={projects} isCompleted={isCompleted} />
              )}
            </div>
          </div>

          {/* Right Panel: Retro AI Terminal (5 Cols) */}
          <div className="terminal-surface lg:col-span-5 flex flex-col h-auto lg:h-[400px] rounded-lg border font-mono text-[11px] leading-relaxed relative select-none">
            {/* Terminal Window Header */}
            <div className="terminal-border terminal-dim flex items-center justify-between border-b px-4 py-2.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500/80" />
                <div className="h-2 w-2 rounded-full bg-yellow-500/80" />
                <div className="h-2 w-2 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] select-none">简历解析结果</span>
              <div className="flex items-center gap-1.5">
                <span className="terminal-accent-bg inline-block h-1.5 w-1.5 rounded-full animate-pulse" />
                <span className="terminal-accent text-[9px] font-bold uppercase tracking-wider">LIVE</span>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 select-text selection:bg-primary/20 max-h-60 lg:max-h-none">
              {streamText ? (
                <pre className="terminal-text whitespace-pre-wrap font-mono break-all">
                  {streamText}
                  {!isCompleted && <span className="terminal-accent-bg inline-block w-1.5 h-3.5 ml-0.5 animate-pulse select-none" style={{ verticalAlign: 'middle' }} />}
                </pre>
              ) : (
                <TerminalSkeleton />
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
