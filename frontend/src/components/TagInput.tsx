import { ClipboardEvent, KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../lib/utils";

type TagInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  inputLabel?: string;
  className?: string;
  disabled?: boolean;
};

function splitTags(value: string): string[] {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TagInput({ value, onChange, placeholder, inputLabel, className, disabled = false }: TagInputProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");

  function addTags(rawValue: string) {
    const tags = splitTags(rawValue);
    if (!tags.length) return;

    const seen = new Set(value.map((item) => item.toLowerCase()));
    const nextTags = tags.filter((tag) => {
      const normalized = tag.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

    if (nextTags.length) {
      onChange([...value, ...nextTags]);
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  }

  function commitDraft() {
    if (!draft.trim()) return;
    addTags(draft);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === "，") {
      event.preventDefault();
      commitDraft();
      return;
    }

    if (event.key === "Backspace" && !draft && value.length) {
      removeTag(value.length - 1);
    }
  }

  function handleInputChange(nextValue: string) {
    if (/[,，\n]/.test(nextValue)) {
      addTags(nextValue);
      setDraft("");
      return;
    }

    setDraft(nextValue);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedText = event.clipboardData.getData("text");
    if (!/[,，\n]/.test(pastedText)) return;

    event.preventDefault();
    addTags(pastedText);
  }

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 transition focus-within:ring-2 focus-within:ring-ring",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {value.map((tag, index) => (
        <span key={`${tag}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground">
          <span className="truncate">{tag}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeTag(index)}
            className="grid h-4 w-4 shrink-0 place-items-center rounded-sm text-muted-foreground transition hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={t("删除 {{name}}", { name: tag })}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        disabled={disabled}
        value={draft}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        onPaste={handlePaste}
        className="min-w-28 flex-1 border-0 bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground"
        placeholder={value.length ? "" : placeholder}
        aria-label={inputLabel ?? placeholder ?? t("标签")}
      />
    </div>
  );
}
