import { statusLabels } from "../../lib/format";
import type { CandidateStatus } from "../../types/api";
import type { BadgeVariant } from "../ui/badge";

export const statusOptions = Object.entries(statusLabels) as Array<[CandidateStatus, string]>;
export const basicFieldLabels: Record<"name" | "phone" | "email" | "city", string> = {
  name: "姓名",
  phone: "电话",
  email: "邮箱",
  city: "所在城市",
};
export const profileSectionLabels: Record<"education" | "work_experience" | "projects", string> = {
  education: "教育经历",
  work_experience: "工作经历",
  projects: "项目经历",
};

export type ProfileForm = {
  name: string;
  phone: string;
  email: string;
  city: string;
  education: string;
  work_experience: string;
  skills: string[];
  projects: string;
};

export const emptyProfileForm: ProfileForm = {
  name: "",
  phone: "",
  email: "",
  city: "",
  education: "[]",
  work_experience: "[]",
  skills: [],
  projects: "[]",
};

export const getDegreeBadgeVariant = (degree: string): BadgeVariant => {
  const d = (degree || "").trim();
  if (d.includes("博士") || d.toLowerCase().includes("phd") || d.toLowerCase().includes("doctor")) {
    return "success";
  }
  if (d.includes("硕士") || d.toLowerCase().includes("master")) {
    return "default";
  }
  if (d.includes("本科") || d.includes("学士") || d.toLowerCase().includes("bachelor")) {
    return "outline";
  }
  return "outline";
};

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function toDisplayText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : String(value);
}

export function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(toDisplayText).filter(Boolean);
}
