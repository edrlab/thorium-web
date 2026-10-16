import { ReadAloudSettings, extractLangRegionFromBCP47 } from "@readium/navigator";

import { ReadAlongVoiceStateObject } from "@/lib/readAlongSettingsReducer";

// Undetermined, for publications that don't declare their language
const UNDETERMINED = "und";

// By base language, as the navigator matches it against content
export const getVoiceLanguageKey = (language?: string): string => language ? extractLangRegionFromBCP47(language)[0] : UNDETERMINED;

// Persisted before voices were stored per language
export const getStoredVoices = (voices: ReadAlongVoiceStateObject | string | null | undefined): ReadAlongVoiceStateObject => {
  return voices && typeof voices === "object" ? voices : {};
};

// Content without a language can't be matched, so it takes its voice for all content
export const toVoicePreference = (voices: ReadAlongVoiceStateObject, language?: string): ReadAloudSettings["voice"] => {
  if (!language) return voices[UNDETERMINED] ?? null;
  return Object.keys(voices).length > 0 ? voices : null;
};
