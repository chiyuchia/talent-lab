import { BarChart3, BriefcaseBusiness, Upload, Users } from "lucide-react";

export const navItems = [
  { to: "/", labelKey: "总览", icon: BarChart3 },
  { to: "/upload", labelKey: "上传", icon: Upload },
  { to: "/candidates", labelKey: "候选人", icon: Users },
  { to: "/jobs", labelKey: "职位", icon: BriefcaseBusiness },
];

export function resolvePageTitleKey(pathname: string): string {
  if (pathname === "/") return "总览";
  if (pathname.startsWith("/upload")) return "上传";
  if (pathname.startsWith("/jobs")) return "职位机会";
  if (pathname.startsWith("/candidates/")) return "候选人详情";
  if (pathname.startsWith("/candidates")) return "候选人";
  return "talent-lab";
}
