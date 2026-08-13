import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import type { NamedRequirement } from "../../types/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { DragHandle } from "./DragHandle";
import { useDragReorder } from "./use-drag-reorder";

type Props = {
  value: NamedRequirement[];
  onChange: (value: NamedRequirement[]) => void;
  kind: "language" | "certificate";
};

export function NamedRequirementsEditor({ value, onChange, kind }: Props) {
  const { t } = useTranslation();
  const nameKey = kind === "language" ? "language" : "name";
  const label = kind === "language" ? t("语言") : t("证书名称");
  const update = (index: number, patch: Partial<NamedRequirement>) =>
    onChange(value.map((item, current) => current === index ? { ...item, ...patch } : item));
  const sortable = useDragReorder(value, onChange);

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
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
          <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[2fr_1fr_1fr_auto]">
          <label className="block space-y-1 text-xs text-muted-foreground">
            {label}
            <Input value={String(item[nameKey] ?? "")} onChange={(e) => update(index, { [nameKey]: e.target.value })} />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            {t("等级或说明")}
            <Input value={item.level} onChange={(e) => update(index, { level: e.target.value })} />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            {t("重要性")}
            <Select value={item.importance} onChange={(e) => update(index, { importance: e.target.value as NamedRequirement["importance"] })}>
              <option value="required">{t("必备")}</option>
              <option value="preferred">{t("加分")}</option>
            </Select>
          </label>
          <Button size="icon" variant="destructive" className="self-end" onClick={() => onChange(value.filter((_, current) => current !== index))} aria-label={t("删除条目") }>
            <Trash2 className="h-4 w-4" />
          </Button>
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange([...value, { [nameKey]: "", level: "", importance: "required" }])}>
        <Plus className="h-4 w-4" /> {kind === "language" ? t("添加语言要求") : t("添加证书要求")}
      </Button>
    </div>
  );
}
