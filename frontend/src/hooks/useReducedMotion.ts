import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function currentPreference() {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(currentPreference);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}
