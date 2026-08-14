import { BarChart3, BriefcaseBusiness, Files } from "lucide-react";

export const navItems = [
  { to: "/", labelKey: "总览", icon: BarChart3 },
  { to: "/resumes", labelKey: "简历", icon: Files },
  { to: "/jobs", labelKey: "职位", icon: BriefcaseBusiness },
];

export function resolvePageTitleKey(pathname: string): string {
  if (pathname === "/") return "总览";
  if (pathname.startsWith("/jobs")) return "职位机会";
  if (pathname === "/resumes/new") return "添加简历";
  if (pathname.startsWith("/resumes/")) return "简历详情";
  if (pathname.startsWith("/resumes")) return "简历";
  if (pathname.startsWith("/candidates/")) return "简历详情";
  if (pathname.startsWith("/upload") || pathname.startsWith("/candidates")) return "简历";
  return "talent-lab";
}
