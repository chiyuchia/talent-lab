import { useEffect, useState } from "react";

export function usePresence(open: boolean, exitDurationMs: number) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setRendered(false), exitDurationMs);
    return () => window.clearTimeout(timer);
  }, [exitDurationMs, open]);

  return { rendered, visible };
}
