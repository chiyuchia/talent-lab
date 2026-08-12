import { BarChart3, BriefcaseBusiness, Upload, Users } from "lucide-react";

export const navItems = [
  { to: "/", label: "总览", icon: BarChart3 },
  { to: "/upload", label: "上传", icon: Upload },
  { to: "/candidates", label: "候选人", icon: Users },
  { to: "/jobs", label: "岗位", icon: BriefcaseBusiness },
];

export function resolvePageTitle(pathname: string): string {
  if (pathname === "/") return "总览";
  if (pathname.startsWith("/upload")) return "上传";
  if (pathname.startsWith("/jobs")) return "岗位";
  if (pathname.startsWith("/candidates/")) return "候选人详情";
  if (pathname.startsWith("/candidates")) return "候选人";
  return "talent-lab";
}
