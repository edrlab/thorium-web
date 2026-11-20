"use client";

import { useAppSelector } from "@/lib/hooks";
import { ReadAlongVerbosityKey } from "@/lib/readAlongSettingsReducer";

// Stored per format, like the reading theme
export const useReadAlongVerbosity = () => {
  const profile = useAppSelector(state => state.reader.profile);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const verbosityObject = useAppSelector(state => state.readAlongSettings.verbosity);

  const verbosityKey: ReadAlongVerbosityKey = profile === "divina"
    ? "divina"
    : profile === "epub" && isFXL ? "fxl" : "reflow";

  // Persisted before verbosity was stored per format
  const verbosity = typeof verbosityObject === "object" ? (verbosityObject?.[verbosityKey] ?? null) : null;

  return { verbosityKey, verbosity };
};
