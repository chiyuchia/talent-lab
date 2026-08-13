import { useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  DragEvent,
  HTMLAttributes,
  KeyboardEvent,
} from "react";

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function useDragReorder<T>(
  items: T[],
  onChange: (items: T[]) => void,
  disabled = false,
) {
  const dragIndex = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function reset() {
    dragIndex.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const target = index + (event.key === "ArrowUp" ? -1 : 1);
    const next = moveItem(items, index, target);
    if (next !== items) onChange(next);
  }

  function itemProps(index: number): HTMLAttributes<HTMLDivElement> {
    return {
      onDragEnter: (event: DragEvent<HTMLDivElement>) => {
        if (dragIndex.current === null || dragIndex.current === index) return;
        event.preventDefault();
        setOverIndex(index);
      },
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        if (dragIndex.current === null) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setOverIndex(index);
      },
      onDrop: (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const from = dragIndex.current;
        if (from !== null) {
          const next = moveItem(items, from, index);
          if (next !== items) onChange(next);
        }
        reset();
      },
    };
  }

  function handleProps(index: number): ButtonHTMLAttributes<HTMLButtonElement> {
    return {
      draggable: !disabled,
      disabled,
      onDragStart: (event) => {
        dragIndex.current = index;
        setDraggingIndex(index);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
      },
      onDragEnd: reset,
      onKeyDown: (event) => moveWithKeyboard(event, index),
    };
  }

  return {
    itemProps,
    handleProps,
    isDragging: (index: number) => draggingIndex === index,
    isOver: (index: number) => overIndex === index && draggingIndex !== index,
  };
}
