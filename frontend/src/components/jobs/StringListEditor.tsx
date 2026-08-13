import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DragHandle } from "./DragHandle";
import { useDragReorder } from "./use-drag-reorder";

type StringListEditorProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  addLabel?: string;
  disabled?: boolean;
};

export function StringListEditor({
  value,
  onChange,
  placeholder,
  addLabel,
  disabled = false,
}: StringListEditorProps) {
  const { t } = useTranslation();
  const sortable = useDragReorder(value, onChange, disabled);

  function addItem() {
    onChange([...value, ""]);
  }

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div
          key={index}
          {...sortable.itemProps(index)}
          className={cn(
            "group/sort flex items-center gap-1 rounded-md transition-all",
            sortable.isDragging(index) && "opacity-40",
            sortable.isOver(index) && "bg-primary/5 ring-2 ring-primary/30",
          )}
        >
          <DragHandle {...sortable.handleProps(index)} />
          <Input
            value={item}
            disabled={disabled}
            onChange={(event) => {
              const next = [...value];
              next[index] = event.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
          />
          <Button size="icon" variant="destructive" disabled={disabled} onClick={() => onChange(value.filter((_, current) => current !== index))} aria-label={t("删除条目") }>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" disabled={disabled} onClick={addItem}>
        <Plus className="h-4 w-4" /> {addLabel ?? t("添加条目")}
      </Button>
    </div>
  );
}
