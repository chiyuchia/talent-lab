import type { Dispatch, SetStateAction } from "react";
import {
  Briefcase,
  Edit3,
  FolderGit2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import type { ResumeProfile } from "../../types/api";
import { Tag } from "../Tag";
import { Button } from "../ui/button";
import { ProfileEducationTab } from "./ProfileEducationTab";
import { ProfileExperienceTab } from "./ProfileExperienceTab";
import { ProfileProjectsTab } from "./ProfileProjectsTab";

type ProfileTab = "education" | "experience" | "projects";

interface ProfilePreviewProps {
  profile: ResumeProfile;
  onEdit: () => void;
  activeTab: ProfileTab;
  setActiveTab: Dispatch<SetStateAction<ProfileTab>>;
}

export function ProfilePreview({
  profile,
  onEdit,
  activeTab,
  setActiveTab,
}: ProfilePreviewProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("简历画像预览")}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
        >
          <Edit3 className="h-4 w-4" /> {t("修改简历")}
        </Button>
      </div>

      {/* Basic Info Details */}
      <div className="grid gap-3.5 md:grid-cols-2 bg-background p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("姓名")}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{profile.name || t("未设定")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Phone className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("电话")}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{profile.phone || t("未设定")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("邮箱")}</p>
            <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{profile.email || t("未设定")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("意向城市")}</p>
            <p className="text-xs font-semibold text-foreground mt-0.5">{profile.city || t("未设定")}</p>
          </div>
        </div>
      </div>

      {/* Skills tags */}
      <div className="p-4 bg-background rounded-lg border border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
          <Sparkles className="h-3.5 w-3.5 text-warning" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t("核心技能")}</span>
        </div>
        {profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill, index) => (
              <Tag key={index}>{skill}</Tag>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("暂无技能标签")}</p>
        )}
      </div>

      {/* Structured Dashboard Panels */}
      <div className="flex flex-col bg-background p-4 rounded-lg border border-border min-h-[300px]">
        {/* Tabs Navigation */}
        <div className="flex border-b border-border pb-2 mb-4 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("education")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              activeTab === "education"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            <GraduationCap className="h-3.5 w-3.5" /> {t("教育经历 ({{value}})", { value: profile.education.length })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("experience")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              activeTab === "experience"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            <Briefcase className="h-3.5 w-3.5" /> {t("工作经历 ({{value}})", { value: profile.work_experience.length })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              activeTab === "projects"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            <FolderGit2 className="h-3.5 w-3.5" /> {t("项目经历 ({{value}})", { value: profile.projects.length })}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1">
          {activeTab === "education" && (
            <ProfileEducationTab education={profile.education} />
          )}
          {activeTab === "experience" && (
            <ProfileExperienceTab workExperience={profile.work_experience} />
          )}
          {activeTab === "projects" && (
            <ProfileProjectsTab projects={profile.projects} />
          )}
        </div>
      </div>
    </div>
  );
}
