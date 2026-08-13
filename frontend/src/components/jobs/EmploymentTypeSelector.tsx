import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import type { EmploymentType } from "../../types/api";

type Props = {
  value: EmploymentType[];
  onChange: (value: EmploymentType[]) => void;
};

const options: Array<{ value: EmploymentType; label: string }> = [
  { value: "full_time", label: "全职" },
  { value: "part_time", label: "兼职" },
  { value: "contract", label: "合同" },
  { value: "internship", label: "实习" },
];

export function EmploymentTypeSelector({ value, onChange }: Props) {
  const { t } = useTranslation();
  function toggle(type: EmploymentType) {
    onChange(value.includes(type)
      ? value.filter((item) => item !== type)
      : [...value, type]);
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={t("用工类型（可多选）")}>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm transition-colors",
              selected && "border-primary/50 bg-primary/5 text-primary",
            )}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggle(option.value)}
              className="h-4 w-4 accent-primary"
            />
            {t(option.label)}
          </label>
        );
      })}
    </div>
  );
}
