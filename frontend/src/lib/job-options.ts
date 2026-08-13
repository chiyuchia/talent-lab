import type { ApplicationStatus } from "../types/api";

export const applicationStatusOptions: Array<{
  value: ApplicationStatus;
  label: string;
}> = [
  { value: "saved", label: "未申请" },
  { value: "preparing", label: "准备中" },
  { value: "applied", label: "已投递" },
  { value: "assessment", label: "笔试或测评" },
  { value: "interview", label: "面试" },
  { value: "offer", label: "Offer" },
  { value: "accepted", label: "已接受" },
  { value: "rejected", label: "已拒绝" },
  { value: "withdrawn", label: "主动结束" },
];

export function applicationStatusLabel(status: ApplicationStatus): string {
  return applicationStatusOptions.find((item) => item.value === status)?.label ?? status;
}
