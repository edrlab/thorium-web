"use client";

import { useAppSelector } from "@/lib/hooks";

// The publication's language, as corrected by the language override
export const useReadAlongLanguage = () => {
  const languageOverride = useAppSelector(state => state.readAlongSettings.languageOverride);
  const metadataLanguage = useAppSelector(state => state.readAlongPlayer.metadata?.language);

  return languageOverride ?? metadataLanguage;
};
