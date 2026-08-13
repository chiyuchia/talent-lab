import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import type { SkillRequirement } from "../../types/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { DragHandle } from "./DragHandle";
import { useDragReorder } from "./use-drag-reorder";

type Props = {
  value: SkillRequirement[];
  onChange: (value: SkillRequirement[]) => void;
};

const emptySkill: SkillRequirement = {
  name: "",
  importance: "required",
  min_years: null,
  proficiency: null,
};

export function SkillRequirementsEditor({ value, onChange }: Props) {
  const { t } = useTranslation();
  const update = (index: number, patch: Partial<SkillRequirement>) =>
    onChange(value.map((item, current) => current === index ? { ...item, ...patch } : item));
  const sortable = useDragReorder(value, onChange);

  return (
    <div className="space-y-3">
      {value.map((skill, index) => (
        <div
          key={index}
          {...sortable.itemProps(index)}
          className={cn(
            "group/sort flex items-center gap-1 rounded-md border border-border bg-background p-3 transition-all",
            sortable.isDragging(index) && "opacity-40",
            sortable.isOver(index) && "border-primary/50 bg-primary/5 ring-2 ring-primary/20",
          )}
        >
          <DragHandle {...sortable.handleProps(index)} />
          <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <label className="block space-y-1 text-xs text-muted-foreground">
            {t("技能名称")}
            <Input value={skill.name} onChange={(e) => update(index, { name: e.target.value })} placeholder="React" />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            {t("重要性")}
            <Select value={skill.importance} onChange={(e) => update(index, { importance: e.target.value as SkillRequirement["importance"] })}>
              <option value="required">{t("必备")}</option>
              <option value="preferred">{t("加分")}</option>
            </Select>
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            {t("最低年限")}
            <Input type="number" min="0" step="0.5" value={skill.min_years ?? ""} onChange={(e) => update(index, { min_years: e.target.value ? Number(e.target.value) : null })} />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            {t("要求程度")}
            <Select value={skill.proficiency ?? ""} onChange={(e) => update(index, { proficiency: (e.target.value || null) as SkillRequirement["proficiency"] })}>
              <option value="">{t("未指定")}</option>
              <option value="basic">{t("了解")}</option>
              <option value="familiar">{t("熟悉")}</option>
              <option value="proficient">{t("熟练")}</option>
              <option value="expert">{t("精通")}</option>
            </Select>
          </label>
          <Button size="icon" variant="destructive" className="self-end" onClick={() => onChange(value.filter((_, current) => current !== index))} aria-label={t("删除技能") }>
            <Trash2 className="h-4 w-4" />
          </Button>
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange([...value, { ...emptySkill }])}>
        <Plus className="h-4 w-4" /> {t("添加技能要求")}
      </Button>
    </div>
  );
}
