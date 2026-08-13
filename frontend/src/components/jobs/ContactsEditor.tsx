import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import type { JobContact } from "../../types/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DragHandle } from "./DragHandle";
import { useDragReorder } from "./use-drag-reorder";

type Props = { value: JobContact[]; onChange: (value: JobContact[]) => void };
const emptyContact: JobContact = { name: "", role: "", contact: "", notes: "" };

export function ContactsEditor({ value, onChange }: Props) {
  const { t } = useTranslation();
  const update = (index: number, patch: Partial<JobContact>) =>
    onChange(value.map((item, current) => current === index ? { ...item, ...patch } : item));
  const sortable = useDragReorder(value, onChange);
  return (
    <div className="space-y-2">
      {value.map((contact, index) => (
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
          <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[1fr_1fr_1.5fr_2fr_auto]">
          <Input value={contact.name} onChange={(e) => update(index, { name: e.target.value })} placeholder={t("姓名") } />
          <Input value={contact.role} onChange={(e) => update(index, { role: e.target.value })} placeholder={t("角色") } />
          <Input value={contact.contact} onChange={(e) => update(index, { contact: e.target.value })} placeholder={t("邮箱、电话或主页") } />
          <Input value={contact.notes} onChange={(e) => update(index, { notes: e.target.value })} placeholder={t("备注") } />
          <Button size="icon" variant="destructive" onClick={() => onChange(value.filter((_, current) => current !== index))} aria-label={t("删除联系人") }>
            <Trash2 className="h-4 w-4" />
          </Button>
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange([...value, { ...emptyContact }])}>
        <Plus className="h-4 w-4" /> {t("添加联系人")}
      </Button>
    </div>
  );
}
